require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS configuration with correct domain
app.use(cors({
  origin: ['https://aiworkflow-seven.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debug endpoint to check CORS
app.options('*', (req, res) => {
  console.log('Received OPTIONS request from:', req.headers.origin);
  res.status(200).end();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    allowedOrigins: ['https://aiworkflow-seven.vercel.app', 'http://localhost:3000']
  });
});

app.post('/api/llm/generate', async (req, res) => {
  try {
    console.log('Received LLM request:', {
      model: req.body.model,
      prompt: req.body.prompt,
      maxTokens: req.body.maxTokens,
      temperature: req.body.temperature
    });

    const { model, prompt, apiKey, maxTokens = 1000, temperature = 0.7 } = req.body;

    if (!model || !prompt || !apiKey) {
      console.error('Missing required fields:', { model, prompt, hasApiKey: !!apiKey });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let response;
    if (model === 'deepseek') {
      const deepseekUrl = 'https://api.deepseek.com/v1/chat/completions';
      response = await axios.post(
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
      console.log('Deepseek response:', response.data);
      return res.json({ response: response.data.choices[0].message.content });
    } else {
      return res.status(400).json({ error: 'Unsupported model' });
    }
  } catch (error) {
    console.error('LLM API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
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

const port = process.env.PORT || 3002;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
