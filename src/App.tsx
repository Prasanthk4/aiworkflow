import React, { useEffect } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import WorkflowBuilder from './components/WorkflowBuilder';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import ChatPage from './components/ChatPage';
import ChatButton from './components/ChatButton';
import { testBackendConnection } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3182ce',
    },
    secondary: {
      main: '#38a169',
    },
  },
});

function AppContent() {
  const { isChatOpen } = useWorkflow();
  
  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {!isChatOpen ? (
        <>
          <Box sx={{ height: '100vh', width: '100vw' }}>
            <WorkflowBuilder />
          </Box>
          <ChatButton />
        </>
      ) : (
        <ChatPage />
      )}
    </Box>
  );
}

function App() {
  useEffect(() => {
    // Test backend connection on app load
    testBackendConnection()
      .then(result => console.log('Backend connection test:', result))
      .catch(error => console.error('Backend connection failed:', error));
  }, []);

  console.log('Environment Variables:', {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV
  });

  return (
    <ThemeProvider theme={theme}>
      <WorkflowProvider>
        <AppContent />
      </WorkflowProvider>
    </ThemeProvider>
  );
}

export default App;
