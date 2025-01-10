import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useWorkflow } from '../context/WorkflowContext';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const ChatInterface = () => {
  const { isChatOpen, setIsChatOpen } = useWorkflow();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleClose = () => {
    setIsChatOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    // TODO: Implement actual API call to the workflow
    // For now, just simulate a response
    setTimeout(() => {
      const aiMessage: Message = {
        text: 'This is a simulated response from the AI.',
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog
      open={isChatOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle>
        AI Assistant
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: 2,
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 2,
            }}
          >
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography color="text.secondary">
                  Ask me anything, and I'll do my best to provide you with accurate
                  and helpful information.
                </Typography>
              </Box>
            ) : (
              messages.map((message, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Paper>
              ))
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Write your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim()}
              sx={{ alignSelf: 'flex-end' }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInterface;
