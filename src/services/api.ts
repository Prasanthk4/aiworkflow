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

export const generateLLMResponse = async ({
  model,
  prompt,
  apiKey,
  maxTokens,
  temperature,
}: LLMRequest): Promise<string> => {
  try {
    console.log('Making request to:', `${BACKEND_URL}/api/llm/generate`);
    const { data } = await axios.post<LLMResponse>(
      `${BACKEND_URL}/api/llm/generate`,
      {
        model,
        prompt,
        apiKey,
        maxTokens,
        temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return data.response;
  } catch (error: any) {
    console.error('API Error:', {
      error,
      url: BACKEND_URL,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.error || 'Failed to generate response');
  }
};
