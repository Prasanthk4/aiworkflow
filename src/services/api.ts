import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://ai-workflow-backend.onrender.com';

// Debug log for backend URL
console.log('[API Config] Using backend URL:', BACKEND_URL);

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
  withCredentials: false // CORS credentials not needed
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('[API Request]', {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    headers: request.headers
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('[API Response]', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('[API Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export const generateLLMResponse = async ({
  model,
  prompt,
  apiKey,
  maxTokens = 1000,
  temperature = 0.7,
}: LLMRequest): Promise<string> => {
  try {
    const { data } = await api.post<LLMResponse>('/api/llm/generate', {
      model,
      prompt,
      apiKey,
      maxTokens,
      temperature,
    });

    return data.response;
  } catch (error: any) {
    console.error('[LLM Error]', {
      error,
      response: error.response?.data
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

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const { data } = await api.get('/api/test');
    console.log('[Backend Test]', data);
    return data;
  } catch (error: any) {
    console.error('[Backend Test Error]', {
      message: error.message,
      response: error.response?.data
    });
    throw error;
  }
};
