import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, TextField, Typography, Tooltip, Divider } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import LoadingOverlay from '../LoadingOverlay';
import { useWorkflow } from '../../context/WorkflowContext';

interface InputNodeProps {
  id: string;
  data: {
    label: string;
  };
}

const InputNode = ({ id, data }: InputNodeProps) => {
  const { nodeData, updateNodeData } = useWorkflow();
  const [isHovered, setIsHovered] = React.useState(false);

  const currentData = nodeData[id] || {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    updateNodeData(id, { 
      value: newValue,
      output: newValue,
      type: 'input'
    });
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: 'linear-gradient(145deg, #ffffff, #f0fff4)',
        padding: '2px',
        borderRadius: '2px',
        width: '100px',
        minHeight: '30px',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(66, 153, 225, 0.2)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          '& .input-preview': {
            display: 'block',
          },
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        '& .MuiTextField-root': {
          marginBottom: '1px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '2px',
            '& fieldset': {
              borderColor: 'rgba(66, 153, 225, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(66, 153, 225, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4299e1',
            }
          },
          '& .MuiInputBase-input': {
            padding: '1px 2px',
            fontSize: '0.6rem',
            height: '0.7rem',
            lineHeight: '0.7rem'
          }
        },
        '& .MuiTypography-root': {
          fontSize: '0.6rem',
          marginBottom: '1px',
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 0.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <DescriptionOutlinedIcon 
            className="node-header-icon"
            sx={{ 
              fontSize: '0.5rem',
              color: '#3182ce',
              animation: 'fadeIn 0.3s ease-in'
            }} 
          />
          <Typography 
            variant="h6"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2c5282, #4299e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            INPUT
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 0.5, opacity: 0.6 }} />

      <Box sx={{ p: '0 2px' }}>
        <TextField
          multiline
          rows={2}
          minRows={2}
          maxRows={4}
          placeholder="Enter your text here..."
          variant="outlined"
          fullWidth
          value={currentData.value || ''}
          onChange={handleChange}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '2px',
              transition: 'all 0.2s',
              '& textarea': {
                minHeight: '10px !important',
                height: 'auto !important',
                overflow: 'hidden',
              },
              '& fieldset': {
                borderColor: 'rgba(66, 153, 225, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(66, 153, 225, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4299e1',
              }
            }
          }}
        />
      </Box>

      {/* Preview popup */}
      <Box
        className="input-preview"
        sx={{
          display: 'none',
          position: 'absolute',
          top: '100%',
          left: '0',
          zIndex: 1000,
          width: '200px',
          maxHeight: '300px',
          overflowY: 'auto',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '4px',
          border: '1px solid rgba(66, 153, 225, 0.2)',
          p: 1,
          mt: 0.5,
          '& pre': {
            margin: 0,
            fontSize: '0.7rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#2d3748'
          }
        }}
      >
        <pre>{currentData.value || ''}</pre>
      </Box>

      <Handle
        type="source"
        position={Position.Right}
        className="node-handle"
        style={{
          opacity: isHovered ? 1 : 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.2s ease',
          width: '6px',
          height: '6px',
          backgroundColor: '#fff',
          border: '2px solid #3182ce',
          right: '-3px'
        }}
      />
    </Box>
  );
};

export default InputNode;
