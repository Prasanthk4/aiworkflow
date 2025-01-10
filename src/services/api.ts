import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3002';

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
  withCredentials: false // Changed to false since we don't need credentials
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('[API Request]', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('[API Response]', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('[API Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
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

    if (!data || !data.response) {
      throw new Error('Invalid response format from server');
    }

    return data.response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    }

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error('Failed to generate response. Please try again.');
  }
};

// Add test function
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/api/test');
    console.log('[Test Response]', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Test Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error('Failed to connect to backend');
  }
};
