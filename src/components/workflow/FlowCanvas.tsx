
import React, { useRef, useCallback, useEffect } from 'react';
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
import useToolStore from '@/store/toolStore';

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
  
  const { activeTool } = useToolStore();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, project } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

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
    if (activeTool !== 'select') return;
    setSelectedNode(null);
    onNodeClick("");
  };

  // Drawing functionality
  useEffect(() => {
    const rfElement = document.querySelector('.react-flow');
    if (!rfElement) return;
    
    canvasRef.current = rfElement as HTMLDivElement;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (activeTool === 'draw') {
        isDrawingRef.current = true;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          lastPosRef.current = { x, y };
          
          // Create an SVG element for drawing if it doesn't exist
          let svg = document.querySelector('.drawing-layer');
          if (!svg) {
            svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.classList.add('drawing-layer');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 5;');
            canvasRef.current?.appendChild(svg);
          }
        }
      } else if (activeTool === 'circle' || activeTool === 'square' || 
                activeTool === 'rectangle' || activeTool === 'triangle') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Create the shape at the clicked position
          createShape(activeTool, x, y);
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (activeTool === 'draw' && isDrawingRef.current) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Draw a line from the last position to the current position
          const svg = document.querySelector('.drawing-layer');
          if (svg) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('x1', lastPosRef.current.x.toString());
            line.setAttribute('y1', lastPosRef.current.y.toString());
            line.setAttribute('x2', x.toString());
            line.setAttribute('y2', y.toString());
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
            
            lastPosRef.current = { x, y };
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      if (activeTool === 'draw') {
        isDrawingRef.current = false;
      }
    };
    
    // Create a shape based on the selected tool
    const createShape = (tool: string, x: number, y: number) => {
      const svg = document.querySelector('.drawing-layer');
      if (!svg) {
        const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        newSvg.classList.add('drawing-layer');
        newSvg.setAttribute('width', '100%');
        newSvg.setAttribute('height', '100%');
        newSvg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 5;');
        canvasRef.current?.appendChild(newSvg);
        return createShape(tool, x, y);
      }
      
      switch (tool) {
        case 'circle':
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute('cx', x.toString());
          circle.setAttribute('cy', y.toString());
          circle.setAttribute('r', '40');
          circle.setAttribute('stroke', 'black');
          circle.setAttribute('stroke-width', '2');
          circle.setAttribute('fill', 'none');
          svg.appendChild(circle);
          break;
          
        case 'square':
          const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          square.setAttribute('x', (x - 40).toString());
          square.setAttribute('y', (y - 40).toString());
          square.setAttribute('width', '80');
          square.setAttribute('height', '80');
          square.setAttribute('stroke', 'black');
          square.setAttribute('stroke-width', '2');
          square.setAttribute('fill', 'none');
          svg.appendChild(square);
          break;
          
        case 'rectangle':
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute('x', (x - 60).toString());
          rect.setAttribute('y', (y - 30).toString());
          rect.setAttribute('width', '120');
          rect.setAttribute('height', '60');
          rect.setAttribute('stroke', 'black');
          rect.setAttribute('stroke-width', '2');
          rect.setAttribute('fill', 'none');
          svg.appendChild(rect);
          break;
          
        case 'triangle':
          const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          triangle.setAttribute('points', `${x},${y-40} ${x-40},${y+20} ${x+40},${y+20}`);
          triangle.setAttribute('stroke', 'black');
          triangle.setAttribute('stroke-width', '2');
          triangle.setAttribute('fill', 'none');
          svg.appendChild(triangle);
          break;
          
        default:
          break;
      }
    };
    
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [activeTool]);

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
