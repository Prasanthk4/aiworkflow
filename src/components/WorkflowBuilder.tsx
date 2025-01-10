import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  NodeTypes,
  BackgroundVariant,
  ReactFlowInstance,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow } from '../context/WorkflowContext';
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import LLMNode from './nodes/LLMNode';
import Sidebar from './Sidebar';
import Header from './Header';
import { Box } from '@mui/material';

const nodeTypes: NodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
};

const WorkflowBuilder = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setNodes,
    updateNodeData
  } = useWorkflow();

  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
      };

      setNodes([...nodes, newNode]);
    },
    [reactFlowInstance, nodes, setNodes]
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          style={{ background: '#fafafa' }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background
            gap={8}
            size={1}
            style={{ backgroundColor: '#fafafa' }}
            variant={BackgroundVariant.Dots}
            color="#94a3b8"
          />
          <Controls 
            position="top-left"
            style={{
              marginTop: '70px',
              marginLeft: '16px',
              borderRadius: '8px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: 16,
              top: 70,
              width: 250,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              p: 2,
              zIndex: 5,
            }}
          >
            <Sidebar />
          </Box>
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default WorkflowBuilder;
