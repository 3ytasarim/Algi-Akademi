#!/bin/bash
# Run each course's exam generation as a separate process with timeout

cd /home/runner/workspace

echo "Fetching courses without exams..."
COURSES=$(node -e "
const {Pool,neonConfig}=require('@neondatabase/serverless');
const ws=require('ws');
neonConfig.webSocketConstructor=ws;
const pool=new Pool({connectionString:process.env.NEON_DATABASE_URL});
pool.query('SELECT c.id, c.title FROM courses c WHERE NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id) ORDER BY c.title').then(r=>{
  r.rows.forEach(row => console.log(row.id + '|||' + row.title));
  return pool.end();
});" 2>&1)

TOTAL=$(echo "$COURSES" | wc -l)
echo "Found $TOTAL courses without exams"
echo ""

SUCCESS=0
FAILED=0
FAILED_LIST=""

I=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  I=$((I+1))
  COURSE_ID=$(echo "$line" | cut -d'|' -f1)
  COURSE_TITLE=$(echo "$line" | sed 's/.*|||//')
  
  printf "[%d/%d] %s... " "$I" "$TOTAL" "$COURSE_TITLE"
  
  RESULT=$(timeout 30 node scripts/single-exam.cjs "$COURSE_ID" "$COURSE_TITLE" 2>&1)
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -eq 0 ] && echo "$RESULT" | grep -q "^OK:"; then
    QQ=$(echo "$RESULT" | grep "^OK:" | sed 's/OK://')
    echo "✅ ${QQ}q"
    SUCCESS=$((SUCCESS+1))
  elif echo "$RESULT" | grep -q "^SKIP:"; then
    echo "⏭ (already exists)"
  else
    echo "❌ (exit:$EXIT_CODE) ${RESULT:0:60}"
    FAILED=$((FAILED+1))
    FAILED_LIST="$FAILED_LIST\n  - $COURSE_TITLE"
  fi
  
  # Small delay between requests
  sleep 1

done <<< "$COURSES"

echo ""
echo "=== DONE ==="
echo "✅ Success: $SUCCESS"
echo "❌ Failed: $FAILED"
if [ -n "$FAILED_LIST" ]; then
  echo -e "Failed courses:$FAILED_LIST"
fi
