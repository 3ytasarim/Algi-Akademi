import { Pool, neonConfig } from '@neondatabase/serverless';
import { Storage } from '@google-cloud/storage';
import ws from 'ws';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
const storage = new Storage();
const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
// Ensure API key contains only ASCII characters (prevents ByteString errors)
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

async function readPDFFromStorage(pdfUrl) {
  try {
    const pdfId = pdfUrl.replace('/pdf/', '').replace('.pdf', '');
    const filePath = `.private/pdfs/${pdfId}.pdf`;
    const bucket = storage.bucket(BUCKET_ID);
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [data] = await file.download();
    const parsed = await pdfParse(data);
    return parsed.text?.trim() || null;
  } catch (e) {
    return null;
  }
}

async function generateQuestions(courseTitle, pdfTexts) {
  const combinedText = pdfTexts.filter(Boolean).join('\n\n').slice(0, 8000);
  
  const prompt = combinedText.length > 100
    ? `Aşağıda "${courseTitle}" eğitim kursunun PDF ders içeriği verilmiştir. Bu içeriğe dayanarak 10 adet çoktan seçmeli sınav sorusu oluştur.

PDF İçeriği:
${combinedText}

Kurallar:
- Sorular yalnızca verilen PDF içeriğinden üretilmeli
- Her soru pratik ve ölçülebilir bilgiyi test etmeli
- 4 seçenek (A, B, C, D) olmalı, yalnızca 1 doğru cevap
- Türkçe yazılmalı

JSON formatında döndür:
{
  "questions": [
    {"question": "Soru?", "a": "...", "b": "...", "c": "...", "d": "...", "correct": "A"}
  ]
}`
    : `"${courseTitle}" mesleki eğitim kursu için 10 adet çoktan seçmeli sınav sorusu oluştur.

Kurallar:
- Sorular bu meslek dalına özgü ve gerçekçi olmalı
- 4 seçenek (A, B, C, D), yalnızca 1 doğru cevap
- Türkçe yazılmalı

JSON formatında döndür:
{
  "questions": [
    {"question": "Soru?", "a": "...", "b": "...", "c": "...", "d": "...", "correct": "A"}
  ]
}`;

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
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
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (response.status === 429) {
        const wait = (attempt + 1) * 10000;
        console.log(`    Rate limited, waiting ${wait/1000}s...`);
        await sleep(wait);
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI ${response.status}: ${err.slice(0, 200)}`);
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
    SELECT c.id, c.title, c.category
    FROM courses c 
    WHERE NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id) 
    ORDER BY c.title
  `);

  console.log(`\n🎯 ${courses.length} kurs için sınav oluşturulacak\n`);

  let success = 0, failed = 0;
  const failedList = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    console.log(`[${i + 1}/${courses.length}] ${course.title}`);

    try {
      // 1. Bu kursa ait PDF URL'lerini bul
      const { rows: lessons } = await pool.query(
        `SELECT pdf_url FROM lessons WHERE course_id = $1 AND pdf_url IS NOT NULL AND pdf_url != '' LIMIT 5`,
        [course.id]
      );

      // 2. PDF'leri oku
      const pdfTexts = [];
      for (const lesson of lessons) {
        process.stdout.write(`    📄 PDF okunuyor: ${lesson.pdf_url}... `);
        const text = await readPDFFromStorage(lesson.pdf_url);
        if (text && text.length > 50) {
          pdfTexts.push(text);
          console.log(`✓ (${text.length} karakter)`);
        } else {
          console.log(`⚠ (içerik yok)`);
        }
      }

      if (lessons.length === 0) {
        console.log(`    ⚠ PDF yok, kurs adına göre soru üretilecek`);
      } else if (pdfTexts.length === 0) {
        console.log(`    ⚠ PDF'ler okunamadı, kurs adına göre soru üretilecek`);
      }

      // 3. OpenAI ile soru üret
      process.stdout.write(`    🤖 Sorular üretiliyor... `);
      const questions = await generateQuestions(course.title, pdfTexts);

      if (!questions || questions.length < 5) {
        throw new Error(`Yalnızca ${questions?.length || 0} soru üretildi`);
      }

      const finalQuestions = questions.slice(0, 10);
      console.log(`✓ ${finalQuestions.length} soru`);

      // 4. Sınavı DB'ye kaydet
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
      console.log(`    ✅ Kaydedildi: ${examTitle}\n`);

      // Rate limiting
      await sleep(1200);

    } catch (err) {
      failed++;
      failedList.push({ title: course.title, error: err.message });
      console.error(`    ❌ Hata: ${err.message}\n`);
      await sleep(3000);
    }
  }

  console.log('\n╔══════════════════════════════╗');
  console.log(`║  ✅ Başarılı: ${String(success).padEnd(15)}║`);
  console.log(`║  ❌ Başarısız: ${String(failed).padEnd(14)}║`);
  console.log('╚══════════════════════════════╝');

  if (failedList.length > 0) {
    console.log('\nBaşarısız kurslar:');
    failedList.forEach(c => console.log(`  - ${c.title}: ${c.error}`));
  }

  await pool.end();
}

main().catch(console.error);
