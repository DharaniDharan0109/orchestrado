
import React from 'react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { 
  Link, 
  Circle, 
  Square, 
  RectangleHorizontal,
  Triangle,
  Pencil,
  Eraser,
  HandMetal,
  ChevronUp,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useToolStore, { ToolType } from '@/store/toolStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  tool: ToolType;
  active: boolean;
  onClick: (tool: ToolType) => void;
  tooltip: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, tool, active, onClick, tooltip }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={active ? "default" : "outline"}
          className={`flex flex-col items-center gap-1 p-3 h-auto ${active ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => onClick(tool)}
        >
          {icon}
          <span className="text-xs">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const DrawerTools: React.FC = () => {
  const { toast } = useToast();
  const { activeTool, setActiveTool } = useToolStore();
  
  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
    toast({
      title: "Tool Selected",
      description: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool activated`,
      duration: 2000,
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 rounded-full px-6 shadow-md"
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Drawing Tools
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-none">
        <DrawerHeader className="text-center">
          <DrawerTitle>Architecture Drawing Tools</DrawerTitle>
          <p className="text-sm text-muted-foreground">Select a tool to modify your workflow diagram</p>
        </DrawerHeader>
        
        <div className="flex justify-center gap-4 p-4 flex-wrap">
          <ToolButton 
            icon={<HandMetal size={24} />} 
            label="Select" 
            tool="select"
            active={activeTool === 'select'}
            onClick={handleToolSelect}
            tooltip="Select and move components"
          />
          <ToolButton 
            icon={<Link size={24} />} 
            label="Connector" 
            tool="connector"
            active={activeTool === 'connector'}
            onClick={handleToolSelect}
            tooltip="Connect elements with lines"
          />
          <ToolButton 
            icon={<Circle size={24} />} 
            label="Circle" 
            tool="circle"
            active={activeTool === 'circle'}
            onClick={handleToolSelect}
            tooltip="Click and drag to draw a circle"
          />
          <ToolButton 
            icon={<Square size={24} />} 
            label="Square" 
            tool="square"
            active={activeTool === 'square'}
            onClick={handleToolSelect}
            tooltip="Click and drag to draw a square"
          />
          <ToolButton 
            icon={<RectangleHorizontal size={24} />} 
            label="Rectangle" 
            tool="rectangle"
            active={activeTool === 'rectangle'}
            onClick={handleToolSelect}
            tooltip="Click and drag to draw a rectangle"
          />
          <ToolButton 
            icon={<Triangle size={24} />} 
            label="Triangle" 
            tool="triangle"
            active={activeTool === 'triangle'}
            onClick={handleToolSelect}
            tooltip="Click and drag to draw a triangle"
          />
          <ToolButton 
            icon={<Pencil size={24} />} 
            label="Draw" 
            tool="draw"
            active={activeTool === 'draw'}
            onClick={handleToolSelect}
            tooltip="Freehand drawing"
          />
          <ToolButton 
            icon={<Eraser size={24} />} 
            label="Erase" 
            tool="erase"
            active={activeTool === 'erase'}
            onClick={handleToolSelect}
            tooltip="Click on shapes to erase them"
          />
        </div>
        
        <DrawerFooter className="text-center flex flex-col items-center">
          <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
            <Info size={14} />
            {activeTool === 'select' ? 'Click to select nodes or agents' : 
             activeTool === 'draw' ? 'Click and drag to draw freehand on the canvas' : 
             activeTool === 'erase' ? 'Click on elements to erase them' : 
             activeTool === 'connector' ? 'Click and drag between nodes to connect them' :
             'Click and drag on the canvas to create the selected shape'}
          </div>
          <div className="text-xs text-muted-foreground">
            You can switch between tools at any time to edit your workflow diagram
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerTools;
