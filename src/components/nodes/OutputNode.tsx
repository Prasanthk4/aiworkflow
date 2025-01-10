import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Paper, Dialog, IconButton, DialogContent, DialogTitle, Button } from '@mui/material';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useWorkflow } from '../../context/WorkflowContext';

interface OutputNodeProps {
  id: string;
  data: {
    label: string;
  };
}

const OutputNode = ({ id, data }: OutputNodeProps) => {
  const { nodeData } = useWorkflow();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentData = nodeData[id] || {};

  const handleCopy = () => {
    navigator.clipboard.writeText(currentData.value || '');
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
        border: '1px solid rgba(159, 122, 234, 0.2)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
        position: 'relative',
        '& .MuiTypography-root': {
          fontSize: '0.6rem',
          marginBottom: '1px',
          fontFamily: "'JetBrains Mono', monospace"
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="node-handle"
        style={{
          background: '#48bb78',
          width: '8px',
          height: '8px',
          left: '-4px'
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <DataObjectOutlinedIcon 
            sx={{ 
              fontSize: '0.6rem',
              color: '#718096'
            }}
          />
          <Typography 
            variant="h6"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2d3748, #4a5568)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OUTPUT
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          onClick={() => setIsDialogOpen(true)}
          sx={{ 
            padding: '1px',
            '& .MuiSvgIcon-root': { fontSize: '0.7rem' }
          }}
        >
          <OpenInFullIcon />
        </IconButton>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 1,
          backgroundColor: 'rgba(247, 250, 252, 0.8)',
          borderRadius: '2px',
          border: '1px solid #edf2f7',
          minHeight: '20px',
          maxHeight: '40px',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          fontSize: '0.6rem',
          lineHeight: '1.2',
          color: '#2d3748',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        }}
      >
        {currentData.value || ''}
      </Paper>

      {/* Output Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1,
          fontSize: '0.9rem'
        }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Output Content</Typography>
          <Box>
            <IconButton size="small" onClick={handleCopy} sx={{ mr: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: 'rgba(247, 250, 252, 0.95)',
              borderRadius: '4px',
              border: '1px solid #edf2f7',
              minHeight: '200px',
              maxHeight: '500px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              color: '#2d3748',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {currentData.value || ''}
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OutputNode;
