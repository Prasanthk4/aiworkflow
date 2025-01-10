import axios from 'axios';

// Use a fixed port for the backend
const API_BASE_URL = 'http://localhost:3002/api';

interface LLMRequest {
  model: string;
  prompt: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

interface LLMResponse {
  response: string;
}

export const generateLLMResponse = async ({
  model,
  prompt,
  apiKey,
  maxTokens,
  temperature,
}: LLMRequest): Promise<string> => {
  try {
    const { data } = await axios.post<LLMResponse>(`${API_BASE_URL}/llm/generate`, {
      model,
      prompt,
      apiKey,
      maxTokens,
      temperature,
    });

    return data.response;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.error || 'Failed to generate response');
  }
};
