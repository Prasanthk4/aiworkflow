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
app.get('/api/test', async (req, res) => {
  try {
    res.status(200).json({
      message: 'Backend is working!',
      timestamp: new Date().toISOString(),
      origin: req.headers.origin || 'No origin header',
      environment: process.env.NODE_ENV,
      corsSettings: {
        allowedOrigins: corsOptions.origin,
        methods: corsOptions.methods
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/llm/generate', async (req, res) => {
  try {
    console.log('Received LLM request:', {
      model: req.body.model,
      prompt: req.body.prompt,
      maxTokens: req.body.maxTokens,
      temperature: req.body.temperature,
      hasApiKey: !!req.body.apiKey
    });

    const { model, prompt, apiKey, maxTokens = 1000, temperature = 0.7 } = req.body;

    if (!model || !prompt || !apiKey) {
      console.error('Missing required fields:', { model, prompt, hasApiKey: !!apiKey });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (model === 'deepseek') {
      console.log('Making request to Deepseek API...');
      const deepseekUrl = 'https://api.deepseek.com/v1/chat/completions';
      const response = await axios.post(
        deepseekUrl,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Deepseek response status:', response.status);
      console.log('Deepseek response:', JSON.stringify(response.data, null, 2));

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Deepseek API');
      }

      return res.json({ response: response.data.choices[0].message.content });
    } else {
      return res.status(400).json({ error: 'Unsupported model' });
    }
  } catch (error) {
    console.error('LLM API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS origin:`, corsOptions.origin);
});
