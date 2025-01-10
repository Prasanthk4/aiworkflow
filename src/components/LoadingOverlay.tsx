import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingOverlayProps {
  loading?: boolean;
  size?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading = false, size = 20 }) => {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '3px',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.2s ease-in',
        zIndex: 10,
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: '#3182ce',
          animation: 'pulse 2s infinite ease-in-out',
        }}
      />
    </Box>
  );
};

export default LoadingOverlay;
