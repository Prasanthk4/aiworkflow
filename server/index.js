require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// CORS configuration
const corsOptions = {
  origin: ['https://aiworkflow-seven.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('Received preflight request from:', req.headers.origin);
  res.status(200).end();
});

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    corsOrigin: corsOptions.origin
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header',
    environment: process.env.NODE_ENV,
    corsSettings: corsOptions
  });
});

// LLM endpoint
app.post('/api/llm/generate', async (req, res) => {
  try {
    console.log('Received LLM request:', {
      model: req.body.model,
      maxTokens: req.body.maxTokens,
      temperature: req.body.temperature
    });

    // Use the correct model identifier for Deepseek
    const modelName = req.body.model === 'deepseek' ? 'deepseek-chat' : req.body.model;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: modelName,
      messages: [{ role: 'user', content: req.body.prompt }],
      max_tokens: req.body.maxTokens,
      temperature: req.body.temperature,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.body.apiKey}`
      }
    });

    console.log('LLM Response:', response.data);

    res.json({
      response: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('LLM Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.status(500).json({
      error: 'Failed to generate response',
      details: error.response?.data?.error || error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS origin:`, corsOptions.origin);
});
