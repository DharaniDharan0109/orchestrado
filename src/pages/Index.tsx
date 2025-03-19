
import React, { useState, useRef, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useFlowStore, { AgentType } from '@/store/flowStore';
import { nodeTypes } from '@/components/nodes/AgentNodes';
import Sidebar from '@/components/Sidebar';
import PropertyEditor from '@/components/PropertyEditor';
import RecommendedAgents from '@/components/RecommendedAgents';
import WorkflowGenerator from '@/components/WorkflowGenerator';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { 
  Play, 
  Save, 
  FileUp, 
  FileDown, 
  Undo2, 
  Redo2, 
  Grid, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    resetFlow,
    selectedNode,
    gridSnap,
    toggleGridSnap,
    undo,
    redo
  } = useFlowStore();
  
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState<string | null>(null);
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
      
      toast({
        title: "Agent Added",
        description: `Added ${type.replace('Agent', '')} agent to your workflow.`,
      });
    },
    [addNode, screenToFlowPosition, toast]
  );

  // Handle node click
  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node.id);
    setShowEditor(true);
    setShowRecommendations(node.id);
  };

  // Handle pane click
  const onPaneClick = () => {
    setSelectedNode(null);
    setShowRecommendations(null);
  };

  // Run the flow
  const handleRunFlow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Empty Workflow",
        description: "Please add agents to your workflow before running.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Workflow Started",
      description: "Your AI workflow is now running...",
    });

    // Run all nodes in topological order (simplified)
    nodes.forEach((node, index) => {
      setTimeout(() => {
        useFlowStore.getState().updateNodeStatus(node.id, 'running');
        
        // Simulate processing
        setTimeout(() => {
          // 80% chance of success
          const success = Math.random() > 0.2;
          useFlowStore.getState().updateNodeStatus(node.id, success ? 'success' : 'error');
          
          if (!success) {
            toast({
              title: "Error in Workflow",
              description: `${node.data.label} encountered an issue during execution.`,
              variant: "destructive"
            });
          }
        }, 1000);
      }, index * 700); // Stagger starts
    });
  };

  // Export flow as JSON
  const handleExportFlow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Empty Workflow",
        description: "There's nothing to export. Please create a workflow first.",
        variant: "destructive"
      });
      return;
    }

    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ai-workflow.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Workflow Exported",
      description: "Your workflow has been exported as JSON.",
    });
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
            
            toast({
              title: "Workflow Imported",
              description: `Imported ${parsed.nodes.length} agents and ${parsed.edges.length} connections.`,
            });
          }
        } catch (error) {
          console.error('Failed to parse workflow file:', error);
          toast({
            title: "Import Failed",
            description: "The selected file is not a valid workflow JSON.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
    toast({
      title: theme === 'light' ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: "UI theme has been updated.",
    });
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
            deleteKeyCode={['Backspace', 'Delete']}
            snapToGrid={gridSnap}
            snapGrid={[20, 20]}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={4}
            className="bg-background"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#aaa" gap={16} size={1} />
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
              className="bg-card/80 backdrop-blur-sm rounded-lg border shadow-md"
            />
            
            {/* Top Panel - Action buttons */}
            <Panel position="top-right" className="space-x-2">
              <WorkflowGenerator />
              
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
            
            {/* Bottom Panel - Utilities */}
            <Panel position="bottom-left" className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={undo}
                title="Undo last action"
              >
                <Undo2 size={14} />
              </Button>
              
              <Button
                variant="outline"
                size="sm" 
                className="gap-1"
                onClick={redo}
                title="Redo last action"
              >
                <Redo2 size={14} />
              </Button>
              
              <Button
                variant={gridSnap ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={toggleGridSnap}
                title={gridSnap ? "Grid snap enabled" : "Grid snap disabled"}
              >
                <Grid size={14} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleThemeToggle}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to reset the workflow? This will remove all agents and connections.")) {
                    resetFlow();
                    toast({
                      title: "Workflow Reset",
                      description: "Your workflow has been cleared.",
                    });
                  }
                }}
                title="Reset workflow"
              >
                <span className="text-destructive">×</span> Clear
              </Button>
            </Panel>
            
            {/* Recommended agents panel */}
            {showRecommendations && (
              <Panel position="bottom-center">
                <RecommendedAgents nodeId={showRecommendations} />
              </Panel>
            )}
            
            {/* First-time user guide */}
            {nodes.length === 0 && (
              <Panel position="center">
                <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border shadow-md text-center max-w-lg animate-fade-in">
                  <h3 className="text-lg font-semibold mb-2">Welcome to AI Workflow Orchestrator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag agents from the sidebar onto this canvas to create your AI workflow.
                    Connect agents together to build powerful automation pipelines.
                  </p>
                  <div className="flex justify-center">
                    <WorkflowGenerator />
                  </div>
                </div>
              </Panel>
            )}
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

const FlowWithProvider = () => {
  return (
    <ReactFlow>
      <Index />
    </ReactFlow>
  );
};

export default FlowWithProvider;
