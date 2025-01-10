import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Alert, Snackbar, IconButton } from '@mui/material';
import { useWorkflow } from '../context/WorkflowContext';
import ChatIcon from '@mui/icons-material/Chat';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Node } from 'reactflow';

interface HeaderProps {
  onChatOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChatOpen }) => {
  const { nodes, nodeData, isOutputGenerated, setIsChatOpen } = useWorkflow();
  const [error, setError] = React.useState<string | null>(null);
  const [showChatIcon, setShowChatIcon] = React.useState(false);
  const [showChatButton, setShowChatButton] = React.useState(false);

  const handleRunWorkflow = () => {
    setError(null);

    // Find input nodes
    const inputNodes = nodes.filter((node) => {
      return node.type && node.type === 'input';
    });
    if (inputNodes.length === 0) {
      setError('Workflow must have at least one input node');
      return;
    }

    // Check if input nodes have content
    const emptyInputs = inputNodes.filter((node) => {
      return !nodeData[node.id]?.value;
    });
    if (emptyInputs.length > 0) {
      setError('Please provide input for all input nodes');
      return;
    }

    // Find LLM nodes
    const llmNodes = nodes.filter((node) => {
      return node.type && node.type === 'llm';
    });
    if (llmNodes.length === 0) {
      setError('Workflow must have at least one LLM node');
      return;
    }

    // Check if LLM nodes have model selected
    const invalidLLMs = llmNodes.filter((node) => {
      return !nodeData[node.id]?.model;
    });
    if (invalidLLMs.length > 0) {
      setError('Please select a model for all LLM nodes');
      return;
    }

    // TODO: Add actual workflow execution logic here
    console.log('Running workflow...');
  };

  const handleDeployClick = () => {
    if (isOutputGenerated) {
      setShowChatButton(true);
    }
  };

  const handleChatClick = () => {
    setIsChatOpen(true);
    if (onChatOpen) {
      onChatOpen();
    }
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
          }
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontSize: '1.2rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateZ(10px) scale(1.02)',
              }
            }}
          >
            OpenAGI
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {showChatButton && (
              <Button
                variant="outlined"
                onClick={() => setIsChatOpen(true)}
                startIcon={<ChatIcon />}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  borderColor: 'rgba(66, 153, 225, 0.5)',
                  color: '#2b6cb0',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    borderColor: '#2b6cb0',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }
                }}
              >
                Open Chat
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleDeployClick}
              disabled={!isOutputGenerated}
              startIcon={<PlayArrowRoundedIcon />}
              sx={{
                background: isOutputGenerated 
                  ? 'linear-gradient(45deg, #48bb78 30%, #38a169 90%)'
                  : 'linear-gradient(45deg, #a0aec0 30%, #718096 90%)',
                borderRadius: '20px',
                textTransform: 'none',
                padding: '6px 16px',
                boxShadow: isOutputGenerated 
                  ? '0 2px 4px rgba(72, 187, 120, 0.2)'
                  : '0 2px 4px rgba(160, 174, 192, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                opacity: isOutputGenerated ? 1 : 0.7,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s',
                },
                '&:hover': {
                  transform: isOutputGenerated ? 'translateY(-2px)' : 'none',
                  boxShadow: isOutputGenerated 
                    ? '0 4px 6px rgba(72, 187, 120, 0.3)'
                    : '0 2px 4px rgba(160, 174, 192, 0.2)',
                  '&::before': {
                    transform: isOutputGenerated ? 'translateX(100%)' : 'none',
                  }
                },
                '&:active': {
                  transform: isOutputGenerated ? 'translateY(1px)' : 'none',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(45deg, #a0aec0 30%, #718096 90%)',
                  opacity: 0.7,
                }
              }}
            >
              Deploy
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setError(null)}
          icon={<ErrorOutlineIcon />}
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '& .MuiAlert-icon': {
              opacity: 1
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
