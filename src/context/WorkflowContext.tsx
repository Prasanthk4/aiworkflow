import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface NodeData {
  [key: string]: any;
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

interface WorkflowContextType {
  isDeployed: boolean;
  setIsDeployed: (deployed: boolean) => void;
  isOutputGenerated: boolean;
  setIsOutputGenerated: (generated: boolean) => void;
  showChatButton: boolean;
  setShowChatButton: (show: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  nodeData: { [key: string]: NodeData };
  setNodeData: (nodeData: { [key: string]: NodeData }) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  activeLLMConfig: {
    nodeId: string;
    model: string;
    apiKey: string;
    apiBase?: string;
    maxTokens: number;
    temperature: number;
  } | null;
  setActiveLLMConfig: (config: {
    nodeId: string;
    model: string;
    apiKey: string;
    apiBase?: string;
    maxTokens: number;
    temperature: number;
  } | null) => void;
  chatHistories: {
    [nodeId: string]: Message[];
  };
  updateChatHistory: (nodeId: string, messages: Message[]) => void;
  chatSessions: ChatSession[];
  activeChatSession: string | null;
  createNewChatSession: () => void;
  setActiveChatSession: (sessionId: string | null) => void;
  updateChatSession: (sessionId: string, messages: Message[]) => void;
  deleteChatSession: (sessionId: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [isDeployed, setIsDeployed] = useState(false);
  const [isOutputGenerated, setIsOutputGenerated] = useState(false);
  const [showChatButton, setShowChatButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeData, setNodeData] = useState<{ [key: string]: NodeData }>({});
  const [activeLLMConfig, setActiveLLMConfig] = useState<{
    nodeId: string;
    model: string;
    apiKey: string;
    apiBase?: string;
    maxTokens: number;
    temperature: number;
  } | null>(null);
  const [chatHistories, setChatHistories] = useState<{
    [nodeId: string]: Message[];
  }>({});

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<string | null>(null);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodeData(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        ...data
      }
    }));

    // Update connected nodes
    edges.forEach(edge => {
      if (edge.source === nodeId && data.output) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode?.type === 'llm') {
          setNodeData(prev => ({
            ...prev,
            [edge.target]: {
              ...prev[edge.target],
              inputValue: data.output
            }
          }));
        } else if (targetNode?.type === 'output') {
          setNodeData(prev => ({
            ...prev,
            [edge.target]: {
              ...prev[edge.target],
              value: data.output
            }
          }));
        }
      }
    });
  }, [edges, nodes]);

  const updateChatHistory = useCallback((nodeId: string, messages: Message[]) => {
    setChatHistories(prev => ({
      ...prev,
      [nodeId]: messages
    }));
  }, []);

  const createNewChatSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    setChatSessions(prev => [...prev, newSession]);
    setActiveChatSession(newSession.id);
  }, []);

  const updateChatSession = useCallback((sessionId: string, messages: Message[]) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        // Update the title based on the first message if it exists
        const firstUserMessage = messages.find(m => m.sender === 'user');
        const title = firstUserMessage 
          ? firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '')
          : 'New Chat';
        
        return {
          ...session,
          messages,
          title,
          lastUpdated: new Date()
        };
      }
      return session;
    }));
  }, []);

  const deleteChatSession = useCallback((sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeChatSession === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
      setActiveChatSession(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  }, [activeChatSession, chatSessions]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect: OnConnect = useCallback((connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        isDeployed,
        setIsDeployed,
        isOutputGenerated,
        setIsOutputGenerated,
        showChatButton,
        setShowChatButton,
        isChatOpen,
        setIsChatOpen,
        nodes,
        setNodes,
        edges,
        setEdges,
        nodeData,
        setNodeData,
        updateNodeData,
        onNodesChange,
        onEdgesChange,
        onConnect,
        activeLLMConfig,
        setActiveLLMConfig,
        chatHistories,
        updateChatHistory,
        chatSessions,
        activeChatSession,
        createNewChatSession,
        setActiveChatSession,
        updateChatSession,
        deleteChatSession,
      }}
    >
      {children}
      {nodes.length === 0 && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
            backdropFilter: 'blur(10px)',
            padding: '30px 40px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            zIndex: 5,
            animation: 'fadeIn 0.6s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            minWidth: '300px',
            pointerEvents: 'none'
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <AccountTreeIcon style={{ 
              fontSize: '32px', 
              color: 'white',
              animation: 'rotate 20s linear infinite'
            }} />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            background: 'linear-gradient(45deg, #2D3748, #4A5568)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '15px'
          }}>
            Start Building Your Workflow
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '15px',
              color: '#718096',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.8)',
              padding: '8px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              animation: 'slideIn 0.6s ease-out'
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                background: 'linear-gradient(45deg, #4F46E5, #06B6D4)',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }}></span>
              Drag nodes from sidebar
            </div>
            <div style={{
              fontSize: '15px',
              color: '#718096',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.8)',
              padding: '8px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              animation: 'slideIn 0.8s ease-out'
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                background: 'linear-gradient(45deg, #4F46E5, #06B6D4)',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }}></span>
              Connect them to build flow
            </div>
          </div>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -45%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
              }
              @keyframes slideIn {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}
          </style>
        </div>
      )}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
