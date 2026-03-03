import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { randomUUID } from 'crypto';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();

function slugify(text) {
  const map = {
    'ğ':'g','Ğ':'G','ü':'u','Ü':'U','ş':'s','Ş':'S',
    'ı':'i','İ':'I','ö':'o','Ö':'O','ç':'c','Ç':'C'
  };
  return text.split('').map(c => map[c] || c).join('')
    .toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateQuestions(courseTitle) {
  const prompt = `"${courseTitle}" mesleki eğitim kursu için Türkçe 10 adet çoktan seçmeli sınav sorusu oluştur.

Kurallar:
- Sorular bu meslek dalına gerçekten özgü, pratik ve ölçülebilir bilgiyi test etmeli
- Her soru farklı bir konuyu test etmeli
- 4 seçenek (A, B, C, D), yalnızca 1 doğru cevap
- Doğru cevaplar dağılımlı olsun (A, B, C, D hepsi kullanılsın)

JSON formatında döndür (başka hiçbir şey yazma):
{
  "questions": [
    {"question": "Soru metni?", "a": "seçenek A", "b": "seçenek B", "c": "seçenek C", "d": "seçenek D", "correct": "A"}
  ]
}`;

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 3000,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 429) {
        const wait = (attempt + 1) * 15000;
        console.log(`    ⏳ Rate limit, ${wait/1000}s bekleniyor...`);
        await sleep(wait);
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI ${response.status}: ${err.slice(0, 150)}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return content.questions;
    } catch (e) {
      lastError = e;
      if (attempt < 2) await sleep(5000);
    }
  }
  throw lastError;
}

async function main() {
  const { rows: courses } = await pool.query(`
    SELECT c.id, c.title
    FROM courses c 
    WHERE NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id) 
    ORDER BY c.title
  `);

  console.log(`\n🎯 ${courses.length} kurs için sınav oluşturulacak\n`);

  let success = 0, failed = 0;
  const failedList = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    process.stdout.write(`[${i + 1}/${courses.length}] ${course.title}... `);

    try {
      const questions = await generateQuestions(course.title);

      if (!questions || questions.length < 5) {
        throw new Error(`Yalnızca ${questions?.length || 0} soru üretildi`);
      }

      const finalQuestions = questions.slice(0, 10);

      const examId = randomUUID();
      const examTitle = `${course.title} Sınavı`;
      const baseSlug = slugify(course.title) + '-sinavi';
      const { rows: existing } = await pool.query(
        `SELECT slug FROM exams WHERE slug LIKE $1`, [`${baseSlug}%`]
      );
      const slug = existing.length > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

      await pool.query(
        `INSERT INTO exams (id, course_id, title, description, max_score, duration, passing_score, slug)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [examId, course.id, examTitle, `${course.title} kursu değerlendirme sınavı`, 100, 30, 60, slug]
      );

      for (let j = 0; j < finalQuestions.length; j++) {
        const q = finalQuestions[j];
        await pool.query(
          `INSERT INTO exam_questions (id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [randomUUID(), examId, q.question, q.a, q.b, q.c, q.d, q.correct.toUpperCase(), j + 1]
        );
      }

      success++;
      console.log(`✅ (${finalQuestions.length} soru)`);

      await sleep(800);

    } catch (err) {
      failed++;
      failedList.push({ title: course.title, error: err.message });
      console.log(`❌ ${err.message.slice(0, 80)}`);
      await sleep(3000);
    }
  }

  console.log('\n╔════════════════════════════════╗');
  console.log(`║  ✅ Başarılı : ${String(success).padEnd(16)}║`);
  console.log(`║  ❌ Başarısız: ${String(failed).padEnd(16)}║`);
  console.log('╚════════════════════════════════╝');

  if (failedList.length > 0) {
    console.log('\nBaşarısız kurslar:');
    failedList.forEach(c => console.log(`  - ${c.title}: ${c.error}`));
  }

  await pool.end();
}

main().catch(console.error);
