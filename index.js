const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
  console.log(`Healthzz check available at: http://localhost:${port}/health`);
}); 

// docker build -t health-check .
// docker run -p 8080:8080 health-check
