import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

interface LLMRequest {
  model: string;
  prompt: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

class LLMService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  async processRequest({ model, prompt, apiKey, maxTokens = 2048, temperature = 0.7 }: LLMRequest) {
    try {
      switch (model) {
        case 'gpt-3.5-turbo':
        case 'gpt-4':
          return await this.processOpenAI(model, prompt, apiKey, maxTokens, temperature);
        
        case 'gemini-pro':
          return await this.processGemini(prompt, apiKey, temperature);
        
        case 'deepseek':
          return await this.processDeepseek(prompt, apiKey, maxTokens, temperature);
        
        default:
          throw new Error('Unsupported model');
      }
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw error;
    }
  }

  private async processOpenAI(model: string, prompt: string, apiKey: string, maxTokens: number, temperature: number) {
    this.openai = new OpenAI({ apiKey });
    
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0].message.content;
  }

  private async processGemini(prompt: string, apiKey: string, temperature: number) {
    this.gemini = new GoogleGenerativeAI(apiKey);
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
      },
    });

    const response = result.response;
    return response.text();
  }

  private async processDeepseek(prompt: string, apiKey: string, maxTokens: number, temperature: number) {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  }
}

export const llmService = new LLMService();
