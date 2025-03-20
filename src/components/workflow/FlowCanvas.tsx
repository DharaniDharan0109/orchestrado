
import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow
} from '@xyflow/react';
import useFlowStore, { AgentType } from '@/store/flowStore';
import { nodeTypes } from '@/components/nodes/AgentNodes';
import TopRightPanel from './TopRightPanel';
import BottomLeftPanel from './BottomLeftPanel';
import RecommendationsPanel from './RecommendationsPanel';
import EmptyWorkflowMessage from './EmptyWorkflowMessage';
import { useToast } from '@/hooks/use-toast';

interface FlowCanvasProps {
  onNodeClick: (nodeId: string) => void;
  showRecommendations: string | null;
}

const FlowCanvas = ({ onNodeClick, showRecommendations }: FlowCanvasProps) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    gridSnap
  } = useFlowStore();
  
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNode(node.id);
    onNodeClick(node.id);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
    onNodeClick("");
  };

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
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
        <Controls position="bottom-right" showInteractive={false} className="m-6" />
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
          className="bg-card/80 backdrop-blur-sm rounded-lg border shadow-md m-6"
        />
        
        <TopRightPanel />
        <BottomLeftPanel />
        
        {showRecommendations && (
          <RecommendationsPanel nodeId={showRecommendations} />
        )}
        
        {nodes.length === 0 && <EmptyWorkflowMessage />}
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;
