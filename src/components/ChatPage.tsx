import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Paper,
  Divider,
  Button,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWorkflow } from '../context/WorkflowContext';
import { styled } from '@mui/material/styles';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: '260px',
  backgroundColor: '#ffffff',
  borderRight: '1px solid rgba(0, 0, 0, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

const MainChat = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '10px',
    '&:hover': {
      background: '#555',
    },
  },
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: '12px 20px',
  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  backgroundColor: isUser ? '#2563eb' : '#ffffff',
  color: isUser ? '#ffffff' : '#1a202c',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  marginLeft: isUser ? 'auto' : '0',
  marginRight: isUser ? '0' : 'auto',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: '16px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
}));

const NewChatButton = styled(Button)(({ theme }) => ({
  margin: '16px',
  padding: '10px 16px',
  borderRadius: '12px',
  backgroundColor: '#f8fafc',
  color: '#1a202c',
  textTransform: 'none',
  fontWeight: 600,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)',
  },
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  margin: '20px',
  padding: '12px 20px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.12), 0 3px 6px -1px rgba(0, 0, 0, 0.08)',
  },
}));

const ChatListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  '&:hover': {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  '&.active': {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
}));

const ChatPage = () => {
  const { 
    setIsChatOpen, 
    activeLLMConfig,
    chatSessions,
    activeChatSession,
    createNewChatSession,
    setActiveChatSession,
    updateChatSession,
    deleteChatSession,
  } = useWorkflow();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find(session => session.id === activeChatSession);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    // Create initial chat session if none exists
    if (chatSessions.length === 0) {
      createNewChatSession();
    }
  }, [chatSessions.length, createNewChatSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputMessage.trim() && activeLLMConfig && activeChatSession) {
      const newMessage = {
        text: inputMessage,
        sender: 'user' as const,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, newMessage];
      updateChatSession(activeChatSession, updatedMessages);
      
      setInputMessage('');
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:3002/api/llm/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: activeLLMConfig.model,
            prompt: inputMessage,
            apiKey: activeLLMConfig.apiKey,
            maxTokens: activeLLMConfig.maxTokens,
            temperature: activeLLMConfig.temperature,
            history: messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            }))
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API error: ${errorData}`);
        }

        const data = await response.json();
        
        const aiMessage = {
          text: data.response || 'No response received',
          sender: 'ai' as const,
          timestamp: new Date()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        updateChatSession(activeChatSession, finalMessages);
      } catch (error) {
        console.error('Chat Error:', error);
        const errorMessage = {
          text: error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an error while processing your message.',
          sender: 'ai' as const,
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, errorMessage];
        updateChatSession(activeChatSession, finalMessages);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    createNewChatSession();
  };

  const handleDeleteChat = (sessionId: string) => {
    deleteChatSession(sessionId);
  };

  const handleClose = () => {
    setIsChatOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <Sidebar>
        <NewChatButton
          startIcon={<ChatIcon />}
          onClick={handleNewChat}
          fullWidth
        >
          New Chat
        </NewChatButton>
        <Divider />
        <List sx={{ flex: 1, overflowY: 'auto', pt: 0 }}>
          {chatSessions.map((session) => (
            <ChatListItem
              key={session.id}
              className={session.id === activeChatSession ? 'active' : ''}
              onClick={() => setActiveChatSession(session.id)}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(session.id);
                  }}
                  sx={{ color: '#64748b' }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <ChatIcon sx={{ color: session.id === activeChatSession ? '#2563eb' : '#64748b' }} />
              </ListItemIcon>
              <ListItemText
                primary={session.title}
                secondary={new Date(session.lastUpdated).toLocaleString()}
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { color: session.id === activeChatSession ? '#2563eb' : 'inherit' }
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  sx: { fontSize: '0.75rem' }
                }}
              />
            </ChatListItem>
          ))}
        </List>
      </Sidebar>
      <MainChat>
        <ChatHeader>
          <IconButton onClick={handleClose} size="large" sx={{ color: '#2563eb' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {activeSession?.title || 'New Chat'}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </ChatHeader>
        <MessagesContainer>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginLeft: message.sender === 'user' ? 'auto' : '0',
              }}
            >
              {message.sender === 'ai' && (
                <Avatar sx={{ bgcolor: '#2563eb' }}>
                  <SmartToyIcon />
                </Avatar>
              )}
              <MessageBubble isUser={message.sender === 'user'}>
                <Typography>{message.text}</Typography>
              </MessageBubble>
              {message.sender === 'user' && (
                <Avatar sx={{ bgcolor: '#64748b' }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        <InputContainer>
          <InputBase
            sx={{ flex: 1, ml: 1 }}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
          />
          <Tooltip title="Send message">
            <IconButton
              onClick={handleSend}
              disabled={isLoading}
              sx={{
                color: '#2563eb',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.04)',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </InputContainer>
      </MainChat>
    </ChatContainer>
  );
};

export default ChatPage;
