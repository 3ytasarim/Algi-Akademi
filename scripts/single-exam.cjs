'use strict';

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const { randomUUID } = require('crypto');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();

const courseId = process.argv[2];
const courseTitle = process.argv[3];

function slugify(text) {
  const map = {'ğ':'g','Ğ':'G','ü':'u','Ü':'U','ş':'s','Ş':'S','ı':'i','İ':'I','ö':'o','Ö':'O','ç':'c','Ç':'C'};
  return text.split('').map(c => map[c]||c).join('')
    .toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
}

async function main() {
  if (!courseId || !courseTitle) {
    console.log('ERROR: Need courseId and courseTitle as args');
    process.exit(1);
  }

  // Check if exam already exists
  const { rows: existing } = await pool.query('SELECT id FROM exams WHERE course_id = $1', [courseId]);
  if (existing.length > 0) {
    console.log('SKIP: Exam already exists');
    await pool.end();
    process.exit(0);
  }

  // Convert Turkish chars for API prompt to avoid encoding issues
  const safeName = courseTitle
    .replace(/ğ/g,'g').replace(/Ğ/g,'G').replace(/ü/g,'u').replace(/Ü/g,'U')
    .replace(/ş/g,'s').replace(/Ş/g,'S').replace(/ı/g,'i').replace(/İ/g,'I')
    .replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ç/g,'c').replace(/Ç/g,'C');

  const prompt = `For the Turkish vocational course "${safeName}", generate exactly 10 multiple choice questions in Turkish. Return ONLY this JSON structure:
{"questions":[
{"question":"Q1?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"A"},
{"question":"Q2?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"B"},
{"question":"Q3?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"C"},
{"question":"Q4?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"D"},
{"question":"Q5?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"A"},
{"question":"Q6?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"B"},
{"question":"Q7?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"C"},
{"question":"Q8?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"D"},
{"question":"Q9?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"A"},
{"question":"Q10?","a":"opt1","b":"opt2","c":"opt3","d":"opt4","correct":"B"}
]}
Write real questions and options specific to the ${safeName} field. All text in Turkish.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.log(`ERROR: HTTP ${response.status}: ${err.slice(0,100)}`);
    await pool.end();
    process.exit(2);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) { console.log('ERROR: No JSON'); await pool.end(); process.exit(2); }

  const content = JSON.parse(jsonMatch[0]);
  const questions = content.questions;
  if (!questions || questions.length < 5) { console.log('ERROR: Few questions'); await pool.end(); process.exit(2); }

  const finalQ = questions.slice(0, 10);
  const examId = randomUUID();
  const examTitle = `${courseTitle} Sinavi`;
  const baseSlug = slugify(courseTitle) + '-sinavi';
  const { rows: slugExisting } = await pool.query(`SELECT slug FROM exams WHERE slug LIKE $1`, [`${baseSlug}%`]);
  const slug = slugExisting.length > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

  await pool.query(
    `INSERT INTO exams (id, course_id, title, description, max_score, duration, passing_score, slug) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [examId, courseId, examTitle, `${courseTitle} kursu degerlendirme sinavi`, 100, 30, 60, slug]
  );

  for (let j = 0; j < finalQ.length; j++) {
    const q = finalQ[j];
    const correct = (String(q.correct||'A')).trim().toUpperCase()[0] || 'A';
    await pool.query(
      `INSERT INTO exam_questions (id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [randomUUID(), examId, q.question, q.a, q.b, q.c, q.d, correct, j+1]
    );
  }

  console.log(`OK:${finalQ.length}`);
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.log('FATAL:', e.message); pool.end().then(() => process.exit(2)); });
