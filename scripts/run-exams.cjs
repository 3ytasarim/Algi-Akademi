'use strict';

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const { randomUUID } = require('crypto');
const { execSync } = require('child_process');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();

function slugify(text) {
  const map = {'ğ':'g','Ğ':'G','ü':'u','Ü':'U','ş':'s','Ş':'S','ı':'i','İ':'I','ö':'o','Ö':'O','ç':'c','Ç':'C'};
  return text.split('').map(c => map[c]||c).join('')
    .toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callOpenAI(courseTitle) {
  const safeName = courseTitle
    .replace(/ğ/g,'g').replace(/Ğ/g,'G').replace(/ü/g,'u').replace(/Ü/g,'U')
    .replace(/ş/g,'s').replace(/Ş/g,'S').replace(/ı/g,'i').replace(/İ/g,'I')
    .replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ç/g,'c').replace(/Ç/g,'C');

  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `For Turkish vocational course "${safeName}", return ONLY a JSON with exactly 10 multiple choice questions in Turkish:\n{"questions":[{"question":"?","a":"","b":"","c":"","d":"","correct":"A"},{"question":"?","a":"","b":"","c":"","d":"","correct":"B"},{"question":"?","a":"","b":"","c":"","d":"","correct":"C"},{"question":"?","a":"","b":"","c":"","d":"","correct":"D"},{"question":"?","a":"","b":"","c":"","d":"","correct":"A"},{"question":"?","a":"","b":"","c":"","d":"","correct":"B"},{"question":"?","a":"","b":"","c":"","d":"","correct":"C"},{"question":"?","a":"","b":"","c":"","d":"","correct":"D"},{"question":"?","a":"","b":"","c":"","d":"","correct":"A"},{"question":"?","a":"","b":"","c":"","d":"","correct":"B"}]}\nReplace all ? and empty strings with real content about ${safeName}.`
    }],
    temperature: 0.7,
    max_tokens: 2500,
  });

  // Use curl with timeout to avoid Node.js fetch hanging
  const result = execSync(
    `curl -s --max-time 25 -X POST https://api.openai.com/v1/chat/completions ` +
    `-H "Authorization: Bearer ${OPENAI_API_KEY}" ` +
    `-H "Content-Type: application/json" ` +
    `-d '${body.replace(/'/g, "'\\''")}'`,
    { timeout: 30000, maxBuffer: 1024 * 1024 }
  );

  const data = JSON.parse(result.toString());
  if (data.error) throw new Error(data.error.message.slice(0, 100));
  
  const raw = data.choices[0].message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  
  const content = JSON.parse(jsonMatch[0]);
  if (!content.questions || !Array.isArray(content.questions)) throw new Error('No questions array');
  return content.questions;
}

async function main() {
  const { rows: courses } = await pool.query(`
    SELECT c.id, c.title
    FROM courses c
    WHERE NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id)
    ORDER BY c.title
  `);

  console.log(`\n🎯 ${courses.length} kurs icin sinav olusturulacak\n`);

  let success = 0, failed = 0;
  const failedList = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    process.stdout.write(`[${i+1}/${courses.length}] ${course.title}... `);

    let questions;
    try {
      questions = await callOpenAI(course.title);
    } catch (err) {
      // Retry once on failure
      await sleep(3000);
      try {
        questions = await callOpenAI(course.title);
      } catch (err2) {
        failed++;
        failedList.push({ title: course.title, error: err2.message });
        console.log(`❌ ${err2.message.slice(0,60)}`);
        await sleep(2000);
        continue;
      }
    }

    if (!questions || questions.length < 5) {
      failed++;
      failedList.push({ title: course.title, error: `Only ${questions?.length||0} questions` });
      console.log(`❌ Not enough questions`);
      continue;
    }

    try {
      const finalQ = questions.slice(0, 10);
      const examId = randomUUID();
      const examTitle = `${course.title} Sinavi`;
      const baseSlug = slugify(course.title) + '-sinavi';
      const { rows: existing } = await pool.query(`SELECT slug FROM exams WHERE slug LIKE $1`, [`${baseSlug}%`]);
      const slug = existing.length > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

      await pool.query(
        `INSERT INTO exams (id, course_id, title, description, max_score, duration, passing_score, slug) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [examId, course.id, examTitle, `${course.title} kursu degerlendirme sinavi`, 100, 30, 60, slug]
      );

      for (let j = 0; j < finalQ.length; j++) {
        const q = finalQ[j];
        const correct = (String(q.correct||'A')).trim().toUpperCase()[0] || 'A';
        await pool.query(
          `INSERT INTO exam_questions (id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [randomUUID(), examId, q.question, q.a, q.b, q.c, q.d, correct, j+1]
        );
      }

      success++;
      console.log(`✅ ${finalQ.length}q`);
      await sleep(500);
    } catch (dbErr) {
      failed++;
      failedList.push({ title: course.title, error: dbErr.message });
      console.log(`❌ DB error: ${dbErr.message.slice(0,50)}`);
    }
  }

  console.log(`\n=== DONE: ✅${success} ❌${failed} ===`);
  if (failedList.length) {
    console.log('Failed:');
    failedList.forEach(c => console.log(`  - ${c.title}: ${c.error}`));
  }

  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e.message); pool.end().then(() => process.exit(1)); });
