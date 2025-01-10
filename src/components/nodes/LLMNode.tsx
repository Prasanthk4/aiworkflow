import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, TextField, Typography, FormControl, Tooltip, Divider, Button, CircularProgress, IconButton } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import LoadingOverlay from '../LoadingOverlay';
import { useState } from 'react';
import { generateLLMResponse } from '../../services/api';
import { useWorkflow } from '../../context/WorkflowContext';

interface LLMNodeProps {
  id: string;
  data: {
    label: string;
  };
}

const LLMNode = ({ id, data }: LLMNodeProps) => {
  const { nodeData, updateNodeData, setIsOutputGenerated, setActiveLLMConfig } = useWorkflow();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentData = nodeData[id] || {};

  const getDefaultSettings = (model: string) => {
    switch (model) {
      case 'gpt-4':
        return {
          maxTokens: 2000,
          temperature: 0.7,
          maxTokensRange: [1, 4000],
          temperatureRange: [0, 2]
        };
      case 'gpt-3.5-turbo':
        return {
          maxTokens: 1000,
          temperature: 0.7,
          maxTokensRange: [1, 2000],
          temperatureRange: [0, 2]
        };
      case 'deepseek':
        return {
          maxTokens: 1000,
          temperature: 0.7,
          maxTokensRange: [1, 2000],
          temperatureRange: [0, 1]
        };
      case 'gemini-pro':
        return {
          maxTokens: 1000,
          temperature: 0.7,
          maxTokensRange: [1, 2048],
          temperatureRange: [0, 1]
        };
      default:
        return {
          maxTokens: 1000,
          temperature: 0.7,
          maxTokensRange: [1, 2000],
          temperatureRange: [0, 1]
        };
    }
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value;
    const defaults = getDefaultSettings(model);
    updateNodeData(id, { 
      model,
      maxTokens: defaults.maxTokens,
      temperature: defaults.temperature
    });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { apiKey: e.target.value });
  };

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateNodeData(id, { maxTokens: parseInt(e.target.value) || undefined });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateNodeData(id, { temperature: parseFloat(e.target.value) || undefined });
  };

  const handleMaxTokensAdjust = (amount: number) => {
    const current = currentData.maxTokens || getDefaultSettings(currentData.model || 'gpt-3.5-turbo').maxTokens;
    const newValue = Math.min(Math.max(current + amount, getDefaultSettings(currentData.model || 'gpt-3.5-turbo').maxTokensRange[0]), getDefaultSettings(currentData.model || 'gpt-3.5-turbo').maxTokensRange[1]);
    updateNodeData(id, { maxTokens: newValue });
  };

  const handleTemperatureAdjust = (amount: number) => {
    const current = currentData.temperature || getDefaultSettings(currentData.model || 'gpt-3.5-turbo').temperature;
    const newValue = Math.min(Math.max(current + amount, getDefaultSettings(currentData.model || 'gpt-3.5-turbo').temperatureRange[0]), getDefaultSettings(currentData.model || 'gpt-3.5-turbo').temperatureRange[1]);
    const rounded = Math.round(newValue * 10) / 10; // Round to 1 decimal place
    updateNodeData(id, { temperature: rounded });
  };

  const handleExecute = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get input from connected input node
      const inputNode = Object.values(nodeData).find(
        (node: any) => node.output && node.type === 'input'
      );
      if (!inputNode) {
        throw new Error('No input node connected');
      }

      const inputText = inputNode.output;
      if (!inputText) {
        throw new Error('No input text provided');
      }

      const currentData = nodeData[id] || {};
      
      // Save current LLM configuration for chat
      const llmConfig = {
        nodeId: id,
        model: currentData.model || 'gpt-3.5-turbo',
        apiKey: currentData.apiKey || '',
        maxTokens: parseInt(currentData.maxTokens) || 2000,
        temperature: parseFloat(currentData.temperature) || 0.7
      };
      console.log('Setting LLM Config:', llmConfig);
      setActiveLLMConfig(llmConfig);

      // Make API request
      const response = await generateLLMResponse({
        model: currentData.model === 'deepseek' ? 'deepseek-chat' : currentData.model || 'gpt-3.5-turbo',
        prompt: inputText,
        apiKey: currentData.apiKey,
        maxTokens: parseInt(currentData.maxTokens),
        temperature: parseFloat(currentData.temperature),
      });

      if (!response) {
        throw new Error('Failed to generate response');
      }

      // Update both this node's output and connected output nodes
      updateNodeData(id, { output: response });
      
      // Find and update connected output nodes
      Object.entries(nodeData).forEach(([nodeId, node]: [string, any]) => {
        if (node.type === 'output' && node.connections?.includes(id)) {
          updateNodeData(nodeId, { value: response });
        }
      });
      setIsOutputGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate response');
      setIsOutputGenerated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const currentModel = currentData.model || 'gpt-3.5-turbo';
  const settings = getDefaultSettings(currentModel);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: 'linear-gradient(145deg, #ffffff, #f0fff4)',
        padding: '2px',
        borderRadius: '2px',
        width: '120px',
        minHeight: '40px',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(72, 187, 120, 0.2)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
        position: 'relative',
        '& .MuiTextField-root': {
          marginBottom: '1px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '2px',
            '& fieldset': {
              borderColor: 'rgba(72, 187, 120, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(72, 187, 120, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#48bb78',
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
        },
        '& .MuiButton-root': {
          fontSize: '0.6rem',
          padding: '1px 2px',
          minHeight: '16px',
          minWidth: '30px'
        },
        '& .MuiIconButton-root': {
          padding: '1px',
          '& .MuiSvgIcon-root': {
            fontSize: '0.6rem',
          }
        }
      }}
    >
      <LoadingOverlay loading={isLoading} />

      <Handle
        type="target"
        position={Position.Left}
        className="node-handle"
        style={{
          opacity: isHovered ? 1 : 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.2s ease',
          width: '10px',
          height: '10px',
          backgroundColor: '#fff',
          border: '2px solid #48bb78',
          left: '-5px'
        }}
      />

      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 0.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <PsychologyOutlinedIcon 
            className="node-header-icon"
            sx={{ 
              fontSize: '1rem',
              color: '#48bb78',
              animation: 'fadeIn 0.3s ease-in'
            }} 
          />
          <Typography 
            variant="h6"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #276749, #48bb78)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            LLM ENGINE
          </Typography>
        </Box>
        <CircleIcon sx={{ 
          color: isLoading ? '#48bb78' : 'rgba(0,0,0,0.2)',
          fontSize: 8,
          animation: isLoading ? 'pulse 1.5s infinite' : 'none'
        }} />
      </Box>

      <Divider sx={{ mb: 0.5, opacity: 0.6 }} />

      <Box sx={{ mb: 0.5 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 0.3, 
            color: '#4a5568',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          Model
          <CircleIcon sx={{ color: '#e53e3e', fontSize: '4px' }} />
        </Typography>

        <select
          value={currentData.model || "gpt-3.5-turbo"}
          onChange={handleModelChange}
          style={{
            width: '100%',
            padding: '2px 18px 2px 6px',
            fontSize: '0.65rem',
            backgroundColor: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(72, 187, 120, 0.3)',
            borderRadius: '4px',
            outline: 'none',
            cursor: 'pointer',
            height: '20px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(72, 187, 120, 0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 2px center',
            backgroundSize: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            fontWeight: 500,
            color: '#2d3748'
          }}
          onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.95)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(72, 187, 120, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(72, 187, 120, 0.5)';
          }}
          onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(72, 187, 120, 0.3)';
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLSelectElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
            e.currentTarget.style.borderColor = 'rgba(72, 187, 120, 0.4)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSelectElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)';
            e.currentTarget.style.borderColor = 'rgba(72, 187, 120, 0.3)';
          }}
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gemini-pro">Gemini Pro</option>
          <option value="deepseek">Deepseek</option>
        </select>
      </Box>

      <Box sx={{ mb: 0.5 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 0.3, 
            color: '#4a5568',
            fontWeight: 600 
          }}
        >
          API Configuration
        </Typography>

        <Box sx={{ mb: 0.5 }}>
          <Tooltip title={`Enter ${currentData.model === 'gemini-pro' ? 'Google AI' : currentData.model === 'deepseek' ? 'Deepseek' : 'OpenAI'} API Key`} arrow placement="top">
            <TextField
              type="password"
              placeholder={`${currentData.model === 'gemini-pro' ? 'Google AI' : currentData.model === 'deepseek' ? 'Deepseek' : 'OpenAI'} API Key`}
              variant="outlined"
              size="small"
              fullWidth
              className="node-input"
              value={currentData.apiKey || ''}
              onChange={handleApiKeyChange}
              InputProps={{
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '4px',
                  fontSize: '0.55rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px rgba(72, 187, 120, 0.2)',
                  }
                }
              }}
            />
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mb: 0.5 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 0.3, 
            color: '#4a5568',
            fontWeight: 600 
          }}
        >
          Advanced Settings
        </Typography>

        <Box sx={{ p: '8px', backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: '4px', border: '1px solid rgba(72, 187, 120, 0.2)', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#4a5568', mb: 0.5, display: 'block', fontSize: '0.65rem', fontWeight: 500 }}>
            Max Tokens ({settings.maxTokensRange[0]}-{settings.maxTokensRange[1]})
            <Tooltip 
              title={
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>Controls the maximum length of the response.</p>
                  <p style={{ margin: '0 0 8px 0' }}>• 1 token ≈ 4 characters or ¾ of a word</p>
                  <p style={{ margin: '0 0 8px 0' }}>Recommended settings:</p>
                  <p style={{ margin: '0 0 4px 0' }}>• Short (summaries): 100-300</p>
                  <p style={{ margin: '0 0 4px 0' }}>• Medium (paragraphs): 500-1000</p>
                  <p style={{ margin: '0 0 4px 0' }}>• Long (articles): 1000-2000</p>
                  <p style={{ margin: '0' }}>• Very long (GPT-4): 2000-4000</p>
                  <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>Default: 0.7 for good balance</p>
                </div>
              } 
              arrow 
              placement="top"
            >
              <InfoOutlinedIcon sx={{ 
                fontSize: '0.75rem',
                ml: 0.3,
                verticalAlign: 'middle',
                color: '#48bb78',
                cursor: 'help'
              }} />
            </Tooltip>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%', justifyContent: 'center', mb: 1.5 }}>
            <IconButton
              onClick={() => handleMaxTokensAdjust(-100)}
              sx={{
                padding: '2px',
                minWidth: '20px',
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                border: '1px solid rgba(72, 187, 120, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(72, 187, 120, 0.1)',
                },
              }}
            >
              <RemoveIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
            <TextField
              type="number"
              value={currentData.maxTokens || settings.maxTokens}
              onChange={handleMaxTokensChange}
              sx={{
                width: '45px',
                mx: 0.5,
                '& .MuiOutlinedInput-root': {
                  height: '20px',
                }
              }}
            />
            <IconButton
              onClick={() => handleMaxTokensAdjust(100)}
              sx={{
                padding: '2px',
                minWidth: '20px',
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                border: '1px solid rgba(72, 187, 120, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(72, 187, 120, 0.1)',
                },
              }}
            >
              <AddIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
          </Box>

          <Typography variant="caption" sx={{ 
            color: '#4a5568',
            mb: 0.5,
            display: 'block',
            fontSize: '0.7rem',
            fontWeight: 500
          }}>
            Temperature ({settings.temperatureRange[0]}-{settings.temperatureRange[1]})
            <Tooltip 
              title={
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>Controls the randomness/creativity of the response.</p>
                  <p style={{ margin: '0 0 8px 0' }}>Recommended settings:</p>
                  <p style={{ margin: '0 0 4px 0' }}>• 0.1-0.3: Very focused, consistent responses</p>
                  <p style={{ margin: '0 0 4px 0' }}>• 0.4-0.6: Balanced responses</p>
                  <p style={{ margin: '0 0 4px 0' }}>• 0.7-0.9: More creative, varied responses</p>
                  <p style={{ margin: '0' }}>• 1.0+: Highly creative, potentially random</p>
                  <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>Default: 0.7 for good balance</p>
                </div>
              } 
              arrow 
              placement="top"
            >
              <InfoOutlinedIcon sx={{ 
                fontSize: '0.75rem',
                ml: 0.3,
                verticalAlign: 'middle',
                color: '#48bb78',
                cursor: 'help'
              }} />
            </Tooltip>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%', justifyContent: 'center', mb: 1.5 }}>
            <IconButton
              onClick={() => handleTemperatureAdjust(-0.1)}
              sx={{
                padding: '2px',
                minWidth: '20px',
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                border: '1px solid rgba(72, 187, 120, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(72, 187, 120, 0.1)',
                },
              }}
            >
              <RemoveIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
            <TextField
              type="number"
              value={currentData.temperature || settings.temperature}
              onChange={handleTemperatureChange}
              sx={{
                width: '45px',
                mx: 0.5,
                '& .MuiOutlinedInput-root': {
                  height: '20px',
                }
              }}
            />
            <IconButton
              onClick={() => handleTemperatureAdjust(0.1)}
              sx={{
                padding: '2px',
                minWidth: '20px',
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                border: '1px solid rgba(72, 187, 120, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(72, 187, 120, 0.1)',
                },
              }}
            >
              <AddIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {error && (
        <Typography 
          color="error" 
          sx={{ 
            fontSize: '0.55rem',
            mb: 0.5,
            p: 1,
            borderRadius: '4px',
            backgroundColor: 'rgba(229, 62, 62, 0.1)',
            border: '1px solid rgba(229, 62, 62, 0.2)'
          }}
        >
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleExecute}
        disabled={isLoading}
        sx={{
          width: '100%',
          py: 0.5,
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'none',
          background: 'linear-gradient(45deg, #276749, #48bb78)',
          boxShadow: '0 2px 4px rgba(72, 187, 120, 0.2)',
          '&:hover': {
            background: 'linear-gradient(45deg, #22543d, #38a169)',
          }
        }}
      >
        {isLoading ? (
          <CircularProgress size={16} sx={{ color: 'white' }} />
        ) : (
          'Execute'
        )}
      </Button>

      <Handle
        type="source"
        position={Position.Right}
        className="node-handle"
        style={{
          opacity: isHovered ? 1 : 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.2s ease',
          width: '10px',
          height: '10px',
          backgroundColor: '#fff',
          border: '2px solid #48bb78',
          right: '-5px'
        }}
      />
    </Box>
  );
};

export default LLMNode;
