
import React, { useState, useRef, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import 'react-toastify/dist/ReactToastify.css';
import '@xyflow/react/dist/style.css';

import useFlowStore, { AgentType } from '@/store/flowStore';
import { nodeTypes } from '@/components/nodes/AgentNodes';
import Sidebar from '@/components/Sidebar';
import PropertyEditor from '@/components/PropertyEditor';
import { Button } from '@/components/ui/button';
import { Play, Save, FileUp, FileDown } from 'lucide-react';

const Index = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    saveFlow,
    loadFlow,
    selectedNode
  } = useFlowStore();
  
  const [showEditor, setShowEditor] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as AgentType;

      if (typeof type === 'undefined' || !reactFlowBounds || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
    },
    [addNode, screenToFlowPosition]
  );

  // Handle node click
  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node.id);
    setShowEditor(true);
  };

  // Handle pane click
  const onPaneClick = () => {
    setSelectedNode(null);
  };

  // Run or export the flow
  const handleRunFlow = () => {
    // Run all nodes in topological order (simplified)
    nodes.forEach((node, index) => {
      setTimeout(() => {
        useFlowStore.getState().updateNodeStatus(node.id, 'running');
        
        // Simulate processing
        setTimeout(() => {
          // 80% chance of success
          const success = Math.random() > 0.2;
          useFlowStore.getState().updateNodeStatus(node.id, success ? 'success' : 'error');
        }, 1000);
      }, index * 700); // Stagger starts
    });
  };

  // Export flow as JSON
  const handleExportFlow = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ai-workflow.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import flow from JSON
  const handleImportFlow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          if (parsed.nodes && parsed.edges) {
            // Set the nodes and edges directly in the store
            useFlowStore.setState({ nodes: parsed.nodes, edges: parsed.edges });
          }
        } catch (error) {
          console.error('Failed to parse workflow file:', error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={4}
            className="bg-gray-50"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type as AgentType) {
                  case 'scraperAgent':
                    return 'hsl(var(--scraper-color))';
                  case 'nlpAgent':
                    return 'hsl(var(--nlp-color))';
                  case 'factCheckAgent':
                    return 'hsl(var(--factcheck-color))';
                  case 'blockchainAgent':
                    return 'hsl(var(--blockchain-color))';
                  case 'customAgent':
                    return 'hsl(var(--custom-color))';
                  default:
                    return '#eee';
                }
              }}
              maskColor="rgba(240, 240, 240, 0.5)"
              className="bg-white/80 rounded-lg border shadow-md"
            />
            
            <Panel position="top-right" className="space-x-2">
              <Button 
                variant="default" 
                size="sm" 
                className="gap-1"
                onClick={handleRunFlow}
              >
                <Play size={14} /> Run Flow
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={saveFlow}
              >
                <Save size={14} /> Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={handleExportFlow}
              >
                <FileDown size={14} /> Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={handleImportFlow}
              >
                <FileUp size={14} /> Import
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
      
      <PropertyEditor 
        isOpen={showEditor && selectedNode !== null} 
        onClose={() => setShowEditor(false)} 
      />
    </div>
  );
};

// Wrap the component with ReactFlow provider
const FlowWithProvider = () => {
  return (
    <ReactFlow>
      <Index />
    </ReactFlow>
  );
};

export default FlowWithProvider;
