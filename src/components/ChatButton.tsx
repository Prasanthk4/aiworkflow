import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, keyframes } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useWorkflow } from '../context/WorkflowContext';

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(66, 153, 225, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 153, 225, 0);
  }
`;

const ChatButton = () => {
  const { setIsChatOpen, showChatButton } = useWorkflow();
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    if (showChatButton) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000); // Hide notification after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showChatButton]);

  if (!showChatButton) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
        zIndex: 1000,
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      {showNotification && (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '280px',
            animation: `${fadeIn} 0.5s ease-out`,
            border: '1px solid rgba(66, 153, 225, 0.2)',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#2d3748',
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            ✨ Chat with AI Assistant is now available!
          </Typography>
        </Box>
      )}
      <IconButton
        onClick={() => setIsChatOpen(true)}
        sx={{
          backgroundColor: '#4299e1',
          color: 'white',
          width: 56,
          height: 56,
          transition: 'all 0.3s ease',
          animation: `${pulse} 2s infinite`,
          '&:hover': {
            backgroundColor: '#3182ce',
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <ChatIcon 
          sx={{ 
            fontSize: 28,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }} 
        />
      </IconButton>
    </Box>
  );
};

export default ChatButton;
