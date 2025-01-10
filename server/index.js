require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.post('/api/llm/generate', async (req, res) => {
  try {
    const { model, prompt, apiKey, maxTokens = 1000, temperature = 0.7 } = req.body;

    let response;
    switch (model) {
      case 'deepseek':
        response = await axios.post(
          'https://api.deepseek.com/v1/chat/completions',
          {
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: temperature,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
        return res.json({ response: response.data.choices[0].message.content });

      case 'gpt-3.5-turbo':
      case 'gpt-4':
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: temperature,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
        return res.json({ response: response.data.choices[0].message.content });

      case 'gemini-pro':
        response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            params: {
              key: apiKey,
            },
          }
        );
        return res.json({ response: response.data.candidates[0].content.parts[0].text });

      default:
        throw new Error('Unsupported model');
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to generate response'
    });
  }
});

// Use port provided by Render or fallback to 3002
const port = process.env.PORT || 3002;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed origins: ${corsOptions.origin}`);
});
