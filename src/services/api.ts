import axios from 'axios';

// Use environment variable for backend URL with no trailing slash
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3002';

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
    console.log('Using backend URL:', BACKEND_URL); // Debug log
    const { data } = await axios.post<LLMResponse>(`${BACKEND_URL}/api/llm/generate`, {
      model,
      prompt,
      apiKey,
      maxTokens,
      temperature,
    });

    return data.response;
  } catch (error: any) {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(error.response?.data?.error || 'Failed to generate response');
  }
};
