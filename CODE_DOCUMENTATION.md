# AI Workflow Builder - Complete Source Code Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Project Overview

The AI Workflow Builder is a web application that enables users to create, manage, and execute AI workflows using a visual interface. It integrates with various Language Models (LLMs) and provides a chat interface for direct AI interaction.

### Key Features
- Visual workflow editor
- Drag-and-drop node system
- Real-time AI chat interface
- Multiple LLM support
- Workflow state persistence

## Technology Stack

### Frontend
- React 18.2.0
- TypeScript 4.9.5
- React Flow 11.8.3
- Material-UI 5.14.5
- Axios 1.5.0

### Backend
- Node.js 18.x
- Express 4.18.2
- CORS 2.8.5
- Axios for API calls

### Development Tools
- Vercel for frontend deployment
- Render.com for backend hosting
- Git for version control
- ESLint for code quality
- Prettier for code formatting

## Project Structure

```
ai-workflow-builder/
├── src/
│   ├── components/           # React components
│   │   ├── nodes/           # Workflow node components
│   │   │   ├── LLMNode.tsx  # Language model node
│   │   │   └── InputNode.tsx # Input node
│   │   ├── ChatPage.tsx     # Chat interface
│   │   ├── ChatButton.tsx   # Chat trigger button
│   │   └── WorkflowEditor.tsx # Main editor
│   ├── context/
│   │   └── WorkflowContext.tsx # Global state management
│   ├── services/
│   │   ├── api.ts           # API service
│   │   └── storage.ts       # Local storage service
│   ├── types/
│   │   └── workflow.ts      # TypeScript definitions
│   ├── App.tsx              # Root component
│   └── index.tsx            # Entry point
├── server/
│   ├── index.js             # Main server file
│   └── routes/              # API routes
├── public/                  # Static assets
└── config/                  # Configuration files
```

## Frontend Implementation

### 1. React Components

#### 1.1 WorkflowEditor Component
```typescript
// src/components/WorkflowEditor.tsx

import React, { useCallback } from 'react';
import ReactFlow, { 
  Node,
  Edge,
  Connection,
  addEdge
} from 'reactflow';

interface WorkflowEditorProps {
  onSave: (workflow: Workflow) => void;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ onSave }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Handle node connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  // Handle node updates
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
    />
  );
};
```

Key Features:
- Real-time node updates
- Edge connection management
- Custom node type support
- Drag-and-drop functionality

#### 1.2 LLM Node Component
```typescript
// src/components/nodes/LLMNode.tsx

interface LLMNodeData {
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

const LLMNode: React.FC<NodeProps<LLMNodeData>> = ({ data, isConnectable }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await generateLLMResponse({
        model: data.model,
        prompt: data.prompt,
        apiKey: data.apiKey,
        maxTokens: data.maxTokens,
        temperature: data.temperature
      });
      // Handle response
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NodeContainer>
      <ModelSelector value={data.model} onChange={handleModelChange} />
      <ParameterInputs
        maxTokens={data.maxTokens}
        temperature={data.temperature}
        onUpdate={handleParameterUpdate}
      />
      <APIKeyInput value={data.apiKey} onChange={handleAPIKeyChange} />
      <GenerateButton onClick={handleGenerate} loading={loading} />
      {error && <ErrorMessage message={error} />}
    </NodeContainer>
  );
};
```

Features:
- Model selection
- Parameter configuration
- API key management
- Loading states
- Error handling

#### 1.3 Chat Interface
```typescript
// src/components/ChatPage.tsx

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateLLMResponse({
        model: 'deepseek-chat',
        prompt: input,
        apiKey: activeConfig.apiKey,
        maxTokens: 1000,
        temperature: 0.7
      });

      const aiMessage: Message = {
        id: uuidv4(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContainer>
      <MessageList messages={messages} />
      <InputArea
        value={input}
        onChange={setInput}
        onSend={handleSend}
        loading={loading}
      />
    </ChatContainer>
  );
};
```

Features:
- Real-time messaging
- Message history
- Loading states
- Error handling
- Auto-scroll
- Message persistence

### 2. State Management

#### 2.1 Workflow Context
```typescript
// src/context/WorkflowContext.tsx

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  chatSessions: ChatSession[];
  activeChatSession: string | null;
  llmConfig: LLMConfig;
}

export const WorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
}>({
  state: initialState,
  dispatch: () => null
});

export const WorkflowProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  useEffect(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('workflowState');
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
    }
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem('workflowState', JSON.stringify(state));
  }, [state]);

  return (
    <WorkflowContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkflowContext.Provider>
  );
};
```

Features:
- Global state management
- State persistence
- Action dispatching
- Type safety

## Backend Implementation

### 1. Express Server
```javascript
// server/index.js

const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://aiworkflow-seven.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// LLM endpoint
app.post('/api/llm/generate', async (req, res) => {
  try {
    const { model, prompt, apiKey, maxTokens, temperature } = req.body;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: model === 'deepseek' ? 'deepseek-chat' : model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('LLM Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Failed to generate response'
    });
  }
});
```

Features:
- CORS handling
- Request logging
- Error handling
- LLM integration
- Response formatting

## API Integration

### 1. API Service
```typescript
// src/services/api.ts

import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://ai-workflow-backend.onrender.com';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    console.log('[API Request]', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('[API Response]', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('[API Response Error]', {
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const generateLLMResponse = async ({
  model,
  prompt,
  apiKey,
  maxTokens = 1000,
  temperature = 0.7
}: LLMRequest): Promise<string> => {
  try {
    const { data } = await api.post('/api/llm/generate', {
      model,
      prompt,
      apiKey,
      maxTokens,
      temperature
    });
    return data.response;
  } catch (error) {
    console.error('[LLM Error]', error);
    throw new Error(
      error.response?.data?.error || 'Failed to generate response'
    );
  }
};
```

Features:
- Centralized API configuration
- Request/response interceptors
- Error handling
- Type safety
- Logging

## Deployment

### 1. Vercel Configuration
```json
// vercel.json

{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Environment Variables
```typescript
// .env.production
REACT_APP_BACKEND_URL=https://ai-workflow-backend.onrender.com

// .env.development
REACT_APP_BACKEND_URL=http://localhost:3002
```

## Testing

### 1. Component Tests
```typescript
// src/__tests__/LLMNode.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react';
import LLMNode from '../components/nodes/LLMNode';

describe('LLMNode', () => {
  it('should render configuration options', () => {
    const { getByLabelText } = render(<LLMNode data={mockData} />);
    expect(getByLabelText('Model')).toBeInTheDocument();
    expect(getByLabelText('API Key')).toBeInTheDocument();
  });

  it('should handle generation', async () => {
    const { getByText } = render(<LLMNode data={mockData} />);
    fireEvent.click(getByText('Generate'));
    await waitFor(() => {
      expect(getByText('Response:')).toBeInTheDocument();
    });
  });
});
```

### 2. API Tests
```typescript
// src/__tests__/api.test.ts

describe('API Service', () => {
  it('should handle LLM generation', async () => {
    const response = await generateLLMResponse({
      model: 'deepseek-chat',
      prompt: 'Test prompt',
      apiKey: 'test-key'
    });
    expect(response).toBeDefined();
  });

  it('should handle errors', async () => {
    await expect(
      generateLLMResponse({
        model: 'invalid-model',
        prompt: 'Test',
        apiKey: 'invalid-key'
      })
    ).rejects.toThrow();
  });
});
```

## Troubleshooting

### Common Issues and Solutions

1. **API Connection Errors**
   ```typescript
   // Check environment variables
   console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
   
   // Verify CORS settings
   console.log('Origin:', window.location.origin);
   
   // Test API connection
   const testConnection = async () => {
     try {
       await api.get('/health');
       console.log('Backend connected');
     } catch (error) {
       console.error('Connection failed:', error);
     }
   };
   ```

2. **State Management Issues**
   ```typescript
   // Debug context values
   const { state, dispatch } = useWorkflow();
   console.log('Current state:', state);
   
   // Track state updates
   useEffect(() => {
     console.log('State updated:', state);
   }, [state]);
   ```

3. **Performance Optimization**
   ```typescript
   // Memoize expensive computations
   const memoizedValue = useMemo(() => {
     return expensiveCalculation(props.value);
   }, [props.value]);
   
   // Prevent unnecessary re-renders
   const MemoizedComponent = React.memo(({ value }) => {
     return <div>{value}</div>;
   });
   ```

### Error Logging

```typescript
// src/services/logger.ts

export const logger = {
  error: (message: string, error: any) => {
    console.error(`[${new Date().toISOString()}] Error:`, message, error);
    // Send to error tracking service
  },
  info: (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] Info:`, message, data);
  }
};
```

## Security Considerations

### 1. API Key Handling
```typescript
// Never store API keys in code
const apiKey = process.env.REACT_APP_API_KEY;

// Use secure headers
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};
```

### 2. Input Validation
```typescript
const validateInput = (input: string): boolean => {
  // Remove potentially harmful characters
  const sanitized = input.replace(/[<>]/g, '');
  return input === sanitized;
};
```

### 3. Error Message Sanitization
```typescript
const sanitizeError = (error: any): string => {
  // Remove sensitive information
  return process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : error.message;
};
```

This documentation provides a comprehensive overview of the entire codebase, including implementation details, security considerations, and best practices. Each section includes actual code examples and explanations of key features.
