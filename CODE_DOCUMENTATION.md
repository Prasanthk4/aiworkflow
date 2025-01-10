# AI Workflow Builder - Code Documentation

## Table of Contents
1. [Project Structure](#project-structure)
2. [Frontend Components](#frontend-components)
3. [Backend Services](#backend-services)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Deployment Configuration](#deployment-configuration)

## Project Structure

```
ai-workflow-builder/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── services/          # API and utility services
│   └── types/             # TypeScript type definitions
├── server/                # Backend source code
│   ├── index.js          # Main server file
│   └── routes/           # API routes
├── public/               # Static assets
└── config/               # Configuration files
```

## Frontend Components

### 1. WorkflowEditor Component
```typescript
// src/components/WorkflowEditor.tsx
/**
 * Main workflow editor component using React Flow
 * Handles node creation, connection, and workflow state
 */
interface WorkflowEditorProps {
  onSave: (workflow: Workflow) => void;
}
```

Key Features:
- Drag-and-drop interface
- Node connection management
- Real-time workflow updates
- Custom node types support

### 2. Node Components

#### LLMNode
```typescript
// src/components/nodes/LLMNode.tsx
/**
 * Language Model node for AI text generation
 * Configurable with different models and parameters
 */
interface LLMNodeData {
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}
```

Features:
- Model selection
- Parameter configuration
- API key management
- Response handling

#### InputNode
```typescript
// src/components/nodes/InputNode.tsx
/**
 * Input node for user text entry
 * Supports multiple input types
 */
interface InputNodeData {
  type: 'text' | 'number' | 'select';
  value: string;
}
```

### 3. Chat Interface

#### ChatPage
```typescript
// src/components/ChatPage.tsx
/**
 * Main chat interface component
 * Handles message history and AI interactions
 */
interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
```

Features:
- Real-time messaging
- Message history
- Error handling
- Loading states

## Backend Services

### 1. Express Server
```javascript
// server/index.js
/**
 * Main server configuration and middleware setup
 */
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
```

Key Middleware:
- CORS handling
- JSON parsing
- Error handling
- Request logging

### 2. LLM Integration
```javascript
// server/routes/llm.js
/**
 * LLM API route handler
 * Manages requests to AI models
 */
router.post('/generate', async (req, res) => {
  const { model, prompt, apiKey } = req.body;
  // Model-specific handling
});
```

Features:
- Multiple model support
- Error handling
- Response formatting
- Rate limiting

## API Integration

### 1. API Service
```typescript
// src/services/api.ts
/**
 * Centralized API service for frontend
 * Handles all backend communication
 */
export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

Key Methods:
- `generateLLMResponse`: AI text generation
- `testConnection`: Backend health check
- Error interceptors
- Request logging

## State Management

### 1. Workflow Context
```typescript
// src/context/WorkflowContext.tsx
/**
 * Global state management for workflow data
 * Provides workflow operations to all components
 */
interface WorkflowContextType {
  nodes: Node[];
  edges: Edge[];
  chatSessions: ChatSession[];
  activeChatSession: string | null;
}
```

Features:
- Workflow state management
- Chat session handling
- Node/edge operations
- Global configuration

### 2. Local Storage Integration
```typescript
// src/services/storage.ts
/**
 * Local storage service for persistence
 * Handles saving and loading workflow state
 */
export const saveWorkflow = (workflow: Workflow) => {
  localStorage.setItem('workflow', JSON.stringify(workflow));
};
```

## Deployment Configuration

### 1. Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ]
}
```

Features:
- Static file serving
- Build configuration
- Route handling

### 2. Environment Configuration
```typescript
// src/config/environment.ts
/**
 * Environment configuration management
 * Handles different deployment environments
 */
export const config = {
  backendUrl: process.env.REACT_APP_BACKEND_URL,
  environment: process.env.NODE_ENV
};
```

## Code Examples

### 1. Creating a New Node
```typescript
const handleAddNode = (type: string) => {
  const newNode = {
    id: `node-${Date.now()}`,
    type,
    position: { x: 100, y: 100 },
    data: { label: `New ${type} Node` }
  };
  setNodes((nodes) => [...nodes, newNode]);
};
```

### 2. Handling LLM Responses
```typescript
const generateResponse = async (prompt: string) => {
  try {
    const response = await generateLLMResponse({
      model: 'deepseek-chat',
      prompt,
      apiKey,
      maxTokens: 1000,
      temperature: 0.7
    });
    return response;
  } catch (error) {
    console.error('LLM Error:', error);
    throw error;
  }
};
```

### 3. Chat Session Management
```typescript
const createNewChatSession = () => {
  const newSession = {
    id: uuidv4(),
    messages: [],
    createdAt: new Date()
  };
  setChatSessions([...chatSessions, newSession]);
  setActiveChatSession(newSession.id);
};
```

## Best Practices

### 1. Error Handling
- Consistent error structure
- User-friendly error messages
- Detailed error logging
- Graceful fallbacks

### 2. Performance Optimization
- React.memo for expensive components
- Debounced API calls
- Efficient re-rendering
- Code splitting

### 3. Security
- API key validation
- Input sanitization
- CORS configuration
- Error message sanitization

## Testing

### 1. Component Testing
```typescript
// src/__tests__/LLMNode.test.tsx
describe('LLMNode', () => {
  it('should render configuration options', () => {
    // Test implementation
  });
});
```

### 2. API Testing
```typescript
// src/__tests__/api.test.ts
describe('API Service', () => {
  it('should handle LLM generation', async () => {
    // Test implementation
  });
});
```

## Troubleshooting Guide

### Common Issues
1. **API Connection Errors**
   - Check backend URL configuration
   - Verify API key validity
   - Check CORS settings

2. **Node Connection Issues**
   - Verify node compatibility
   - Check connection validation rules
   - Review edge constraints

3. **State Management Problems**
   - Check context provider wrapping
   - Verify state updates
   - Review component re-renders
