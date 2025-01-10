import express from 'express';
import { llmService } from '../services/llm';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { model, prompt, apiKey, maxTokens, temperature } = req.body;
    
    if (!model || !prompt || !apiKey) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await llmService.processRequest({
      model,
      prompt,
      apiKey,
      maxTokens,
      temperature,
    });

    res.json({ response });
  } catch (error: any) {
    console.error('LLM Route Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router };
