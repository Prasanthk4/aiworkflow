require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: process.env.NODE_ENV });
});

app.post('/api/llm/generate', async (req, res) => {
  try {
    const { model, prompt, apiKey, maxTokens = 1000, temperature = 0.7 } = req.body;

    if (!model || !prompt || !apiKey) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let apiEndpoint;
    let headers;
    let data;

    if (model.toLowerCase().includes('deepseek')) {
      apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      data = {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: temperature,
      };
    } else {
      // Default to OpenAI
      apiEndpoint = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      data = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: temperature,
      };
    }

    const response = await axios.post(apiEndpoint, data, { headers });
    const completion = response.data.choices[0]?.message?.content || response.data.choices[0]?.text;

    res.json({ response: completion });
  } catch (error) {
    console.error('LLM API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.response?.data || error.message
    });
  }
});

const port = process.env.PORT || 3002;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed origins: ${JSON.stringify(corsOptions.origin)}`);
});
