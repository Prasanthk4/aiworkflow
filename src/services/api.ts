import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3002';

// Debug log for backend URL
console.log('Backend URL:', BACKEND_URL);

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

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export const generateLLMResponse = async ({
  model,
  prompt,
  apiKey,
  maxTokens = 1000,
  temperature = 0.7,
}: LLMRequest): Promise<string> => {
  try {
    console.log('Making request to:', `${BACKEND_URL}/api/llm/generate`);
    const { data } = await api.post<LLMResponse>('/api/llm/generate', {
      model,
      prompt,
      apiKey,
      maxTokens,
      temperature,
    });

    if (!data || !data.response) {
      throw new Error('Invalid response format from server');
    }

    return data.response;
  } catch (error: any) {
    console.error('API Error:', {
      error,
      url: BACKEND_URL,
      response: error.response?.data,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    }

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error('Failed to generate response. Please try again.');
  }
};
