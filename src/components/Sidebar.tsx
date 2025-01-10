import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import SettingsIcon from '@mui/icons-material/Settings';
import OutputIcon from '@mui/icons-material/Output';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const NodeItem = ({ type, icon, label }: { type: string; icon: React.ReactNode; label: string }) => (
    <Paper
      elevation={0}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
      sx={{
        p: '10px 12px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '12px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateZ(0)',
        '&:hover': {
          transform: 'translateZ(8px) scale(1.02)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          background: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '& .node-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            color: '#2b6cb0',
          },
          '& .node-label': {
            color: '#2d3748',
            transform: 'translateX(2px)',
          }
        },
        '&:active': {
          cursor: 'grabbing',
          transform: 'translateZ(4px) scale(0.98)',
        }
      }}
    >
      <Box
        className="node-icon"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: '#4a5568',
          transition: 'all 0.3s ease',
        }}
      >
        {icon}
      </Box>
      <Typography
        className="node-label"
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#4a5568',
          transition: 'all 0.3s ease',
        }}
      >
        {label}
      </Typography>
    </Paper>
  );

  return (
    <Box
      sx={{
        p: 2,
        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(8px)',
        height: '100%',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '1px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.02) 100%)',
        }
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: '1rem',
          fontWeight: 600,
          mb: 0.5,
          background: 'linear-gradient(45deg, #2d3748 30%, #4a5568 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.5px',
        }}
      >
        Components
      </Typography>
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#718096',
          mb: 3,
          fontWeight: 500,
        }}
      >
        Drag and Drop
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <NodeItem
          type="input"
          icon={<InputIcon sx={{ fontSize: 20 }} />}
          label="Input"
        />
        <NodeItem
          type="llm"
          icon={<PsychologyIcon sx={{ fontSize: 20 }} />}
          label="LLM Engine"
        />
        <NodeItem
          type="output"
          icon={<OutputIcon sx={{ fontSize: 20 }} />}
          label="Output"
        />
      </Box>
    </Box>
  );
};

export default Sidebar;
