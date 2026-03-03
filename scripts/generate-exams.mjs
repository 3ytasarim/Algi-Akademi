import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { randomUUID } from 'crypto';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

function slugify(text) {
  const turkishMap = {
    'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U', 'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
  };
  return text
    .split('').map(c => turkishMap[c] || c).join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function generateQuestionsWithOpenAI(courseTitle, category) {
  const prompt = `Sen bir Türk eğitim kurumunun sınav hazırlayıcısısın. "${courseTitle}" kursu için ${category} kategorisinde 10 adet çoktan seçmeli sınav sorusu oluştur.

Her soru:
- Kursa özgü ve gerçekçi olmalı
- 4 şık içermeli (A, B, C, D)
- Yalnızca 1 doğru cevabı olmalı
- Türkçe yazılmalı
- Pratik bilgiyi ölçmeli

JSON formatında döndür:
{
  "questions": [
    {
      "question": "Soru metni?",
      "a": "A şıkkı",
      "b": "B şıkkı", 
      "c": "C şıkkı",
      "d": "D şıkkı",
      "correct": "A"
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content.questions;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const { rows: courses } = await pool.query(`
    SELECT c.id, c.title, c.category
    FROM courses c 
    WHERE NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id) 
    ORDER BY c.title
  `);

  console.log(`Found ${courses.length} courses without exams`);

  let success = 0;
  let failed = 0;
  const failedCourses = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    console.log(`[${i + 1}/${courses.length}] Processing: ${course.title}`);

    try {
      const questions = await generateQuestionsWithOpenAI(course.title, course.category);

      if (!questions || questions.length < 10) {
        throw new Error(`Only ${questions?.length || 0} questions generated`);
      }

      const examId = randomUUID();
      const examTitle = `${course.title} Sınavı`;
      const baseSlug = slugify(course.title) + '-sinavi';
      
      // Check slug uniqueness
      const { rows: existing } = await pool.query('SELECT slug FROM exams WHERE slug LIKE $1', [`${baseSlug}%`]);
      const slug = existing.length > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

      await pool.query(`
        INSERT INTO exams (id, course_id, title, description, max_score, duration, passing_score, slug)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [examId, course.id, examTitle, `${course.title} kursu değerlendirme sınavı`, 100, 30, 60, slug]);

      for (let j = 0; j < 10; j++) {
        const q = questions[j];
        const questionId = randomUUID();
        await pool.query(`
          INSERT INTO exam_questions (id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          questionId, examId, q.question,
          q.a, q.b, q.c, q.d,
          q.correct.toUpperCase(),
          j + 1
        ]);
      }

      success++;
      console.log(`  ✓ Created exam: ${examTitle}`);

      // Rate limiting: wait 1.5 seconds between requests
      if (i < courses.length - 1) {
        await sleep(1500);
      }

    } catch (err) {
      failed++;
      failedCourses.push({ title: course.title, error: err.message });
      console.error(`  ✗ Failed: ${err.message}`);
      
      // Wait longer on error (possible rate limit)
      await sleep(3000);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`✓ Success: ${success}`);
  console.log(`✗ Failed: ${failed}`);
  if (failedCourses.length > 0) {
    console.log('\nFailed courses:');
    failedCourses.forEach(c => console.log(`  - ${c.title}: ${c.error}`));
  }

  await pool.end();
}

main().catch(console.error);
