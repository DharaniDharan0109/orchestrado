
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
  
  const { activeTool, setActiveTool, isDragging, setIsDragging } = useToolStore();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const shapeStartPosRef = useRef({ x: 0, y: 0 });
  const temporaryShapeRef = useRef<SVGElement | null>(null);

  // Set cursor style based on active tool
  useEffect(() => {
    const cursor = document.querySelector('.react-flow__pane');
    if (!cursor) return;
    
    switch (activeTool) {
      case 'select':
        cursor.classList.remove('cursor-crosshair');
        cursor.classList.add('cursor-grab');
        break;
      case 'draw':
      case 'circle':
      case 'square':
      case 'rectangle':
      case 'triangle':
      case 'connector':
        cursor.classList.remove('cursor-grab');
        cursor.classList.add('cursor-crosshair');
        break;
      case 'erase':
        cursor.classList.remove('cursor-grab', 'cursor-crosshair');
        cursor.classList.add('cursor-not-allowed');
        break;
      default:
        cursor.classList.remove('cursor-crosshair');
        cursor.classList.add('cursor-grab');
    }
    
    return () => {
      cursor?.classList.remove('cursor-crosshair', 'cursor-grab', 'cursor-not-allowed');
    };
  }, [activeTool]);

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

  // Ensure SVG layer exists
  const ensureSvgLayer = () => {
    let svg = document.querySelector('.drawing-layer');
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add('drawing-layer');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 5;');
      canvasRef.current?.appendChild(svg);
    }
    return svg;
  };

  // Clear temporary shape
  const clearTemporaryShape = () => {
    if (temporaryShapeRef.current) {
      temporaryShapeRef.current.remove();
      temporaryShapeRef.current = null;
    }
  };

  // Drawing functionality
  useEffect(() => {
    const rfElement = document.querySelector('.react-flow');
    if (!rfElement) return;
    
    canvasRef.current = rfElement as HTMLDivElement;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (activeTool === 'select') return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (activeTool === 'draw') {
        isDrawingRef.current = true;
        lastPosRef.current = { x, y };
        ensureSvgLayer();
      } else if (['circle', 'square', 'rectangle', 'triangle'].includes(activeTool)) {
        shapeStartPosRef.current = { x, y };
        setIsDragging(true);
        
        // Create a temporary shape that will be updated during dragging
        const svg = ensureSvgLayer();
        clearTemporaryShape();
        
        switch (activeTool) {
          case 'circle':
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute('cx', x.toString());
            circle.setAttribute('cy', y.toString());
            circle.setAttribute('r', '0');
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('fill', 'none');
            svg.appendChild(circle);
            temporaryShapeRef.current = circle;
            break;
            
          case 'square':
          case 'rectangle':
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute('x', x.toString());
            rect.setAttribute('y', y.toString());
            rect.setAttribute('width', '0');
            rect.setAttribute('height', '0');
            rect.setAttribute('stroke', 'black');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('fill', 'none');
            svg.appendChild(rect);
            temporaryShapeRef.current = rect;
            break;
            
          case 'triangle':
            const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            triangle.setAttribute('points', `${x},${y} ${x},${y} ${x},${y}`);
            triangle.setAttribute('stroke', 'black');
            triangle.setAttribute('stroke-width', '2');
            triangle.setAttribute('fill', 'none');
            svg.appendChild(triangle);
            temporaryShapeRef.current = triangle;
            break;
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (activeTool === 'draw' && isDrawingRef.current) {
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
      } else if (isDragging && temporaryShapeRef.current) {
        // Update the temporary shape based on mouse movement
        const startX = shapeStartPosRef.current.x;
        const startY = shapeStartPosRef.current.y;
        
        switch (activeTool) {
          case 'circle':
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            (temporaryShapeRef.current as SVGCircleElement).setAttribute('r', radius.toString());
            break;
            
          case 'square':
            const sideLength = Math.max(Math.abs(x - startX), Math.abs(y - startY));
            const squareX = x > startX ? startX : startX - sideLength;
            const squareY = y > startY ? startY : startY - sideLength;
            (temporaryShapeRef.current as SVGRectElement).setAttribute('x', squareX.toString());
            (temporaryShapeRef.current as SVGRectElement).setAttribute('y', squareY.toString());
            (temporaryShapeRef.current as SVGRectElement).setAttribute('width', sideLength.toString());
            (temporaryShapeRef.current as SVGRectElement).setAttribute('height', sideLength.toString());
            break;
            
          case 'rectangle':
            const width = Math.abs(x - startX);
            const height = Math.abs(y - startY);
            const rectX = x > startX ? startX : x;
            const rectY = y > startY ? startY : y;
            (temporaryShapeRef.current as SVGRectElement).setAttribute('x', rectX.toString());
            (temporaryShapeRef.current as SVGRectElement).setAttribute('y', rectY.toString());
            (temporaryShapeRef.current as SVGRectElement).setAttribute('width', width.toString());
            (temporaryShapeRef.current as SVGRectElement).setAttribute('height', height.toString());
            break;
            
          case 'triangle':
            const trianglePoints = `${startX},${startY} ${x},${y} ${startX-(x-startX)},${y}`;
            (temporaryShapeRef.current as SVGPolygonElement).setAttribute('points', trianglePoints);
            break;
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (activeTool === 'draw') {
        isDrawingRef.current = false;
      } else if (isDragging) {
        setIsDragging(false);
        
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect && temporaryShapeRef.current) {
          // Finalize the shape
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Create a final shape based on the temporary one
          const svg = ensureSvgLayer();
          const startX = shapeStartPosRef.current.x;
          const startY = shapeStartPosRef.current.y;
          
          switch (activeTool) {
            case 'circle':
              const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
              if (radius > 5) { // Only create if it has some size
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute('cx', startX.toString());
                circle.setAttribute('cy', startY.toString());
                circle.setAttribute('r', radius.toString());
                circle.setAttribute('stroke', 'black');
                circle.setAttribute('stroke-width', '2');
                circle.setAttribute('fill', 'none');
                svg.appendChild(circle);
              }
              break;
              
            case 'square':
              const sideLength = Math.max(Math.abs(x - startX), Math.abs(y - startY));
              if (sideLength > 5) {
                const squareX = x > startX ? startX : startX - sideLength;
                const squareY = y > startY ? startY : startY - sideLength;
                const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                square.setAttribute('x', squareX.toString());
                square.setAttribute('y', squareY.toString());
                square.setAttribute('width', sideLength.toString());
                square.setAttribute('height', sideLength.toString());
                square.setAttribute('stroke', 'black');
                square.setAttribute('stroke-width', '2');
                square.setAttribute('fill', 'none');
                svg.appendChild(square);
              }
              break;
              
            case 'rectangle':
              const width = Math.abs(x - startX);
              const height = Math.abs(y - startY);
              if (width > 5 && height > 5) {
                const rectX = x > startX ? startX : x;
                const rectY = y > startY ? startY : y;
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute('x', rectX.toString());
                rect.setAttribute('y', rectY.toString());
                rect.setAttribute('width', width.toString());
                rect.setAttribute('height', height.toString());
                rect.setAttribute('stroke', 'black');
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('fill', 'none');
                svg.appendChild(rect);
              }
              break;
              
            case 'triangle':
              const xDiff = x - startX;
              const yDiff = y - startY;
              if (Math.abs(xDiff) > 5 && Math.abs(yDiff) > 5) {
                const trianglePoints = `${startX},${startY} ${x},${y} ${startX-(x-startX)},${y}`;
                const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                triangle.setAttribute('points', trianglePoints);
                triangle.setAttribute('stroke', 'black');
                triangle.setAttribute('stroke-width', '2');
                triangle.setAttribute('fill', 'none');
                svg.appendChild(triangle);
              }
              break;
          }
          
          clearTemporaryShape();
        }
      }
    };
    
    // Function to erase shapes
    const handleErase = (e: MouseEvent) => {
      if (activeTool !== 'erase') return;
      
      const svg = document.querySelector('.drawing-layer');
      if (!svg) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Find and remove shapes near the click point
      const shapes = svg.querySelectorAll('circle, rect, polygon, line');
      shapes.forEach(shape => {
        let isNear = false;
        
        if (shape.tagName === 'circle') {
          const cx = parseFloat(shape.getAttribute('cx') || '0');
          const cy = parseFloat(shape.getAttribute('cy') || '0');
          const r = parseFloat(shape.getAttribute('r') || '0');
          const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
          isNear = distance <= r + 10; // 10px margin for easier targeting
        } else if (shape.tagName === 'rect') {
          const rectX = parseFloat(shape.getAttribute('x') || '0');
          const rectY = parseFloat(shape.getAttribute('y') || '0');
          const width = parseFloat(shape.getAttribute('width') || '0');
          const height = parseFloat(shape.getAttribute('height') || '0');
          isNear = x >= rectX - 10 && x <= rectX + width + 10 && 
                  y >= rectY - 10 && y <= rectY + height + 10;
        } else if (shape.tagName === 'polygon') {
          // Simple bounding box check for polygon
          const points = (shape.getAttribute('points') || '').split(' ');
          if (points.length > 0) {
            const coords = points.map(p => {
              const [px, py] = p.split(',').map(Number);
              return { x: px, y: py };
            });
            
            // Find bounding box
            const xValues = coords.map(c => c.x);
            const yValues = coords.map(c => c.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            isNear = x >= minX - 10 && x <= maxX + 10 && 
                    y >= minY - 10 && y <= maxY + 10;
          }
        } else if (shape.tagName === 'line') {
          const x1 = parseFloat(shape.getAttribute('x1') || '0');
          const y1 = parseFloat(shape.getAttribute('y1') || '0');
          const x2 = parseFloat(shape.getAttribute('x2') || '0');
          const y2 = parseFloat(shape.getAttribute('y2') || '0');
          
          // Calculate distance from point to line segment
          const A = x - x1;
          const B = y - y1;
          const C = x2 - x1;
          const D = y2 - y1;
          
          const dot = A * C + B * D;
          const len_sq = C * C + D * D;
          let param = -1;
          if (len_sq !== 0) param = dot / len_sq;
          
          let xx, yy;
          
          if (param < 0) {
            xx = x1;
            yy = y1;
          } else if (param > 1) {
            xx = x2;
            yy = y2;
          } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
          }
          
          const dx = x - xx;
          const dy = y - yy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          isNear = distance <= 10; // 10px margin
        }
        
        if (isNear) {
          shape.remove();
        }
      });
    };
    
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      if (activeTool === 'erase') {
        canvasRef.current.addEventListener('click', handleErase);
      }
    }
    
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('click', handleErase);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [activeTool, isDragging, setIsDragging]);

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
