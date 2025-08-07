// Vercel serverless function fallback
export default function handler(req, res) {
  // Redirect API calls to main domain
  const { url, method } = req;
  
  if (url.startsWith('/api/')) {
    return res.status(503).json({
      error: 'API not available in static deployment',
      message: 'Please use autoscale deployment for full functionality',
      suggestion: 'Change deployment type from Static to Autoscale'
    });
  }
  
  res.status(404).json({ error: 'Not found' });
}