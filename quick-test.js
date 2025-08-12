// Quick production test
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', message: 'Server is working' });
});

app.post('/api/courses', (req, res) => {
  console.log('Course creation request received:', req.body);
  res.json({ 
    success: true, 
    message: 'Course would be created',
    data: req.body
  });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});