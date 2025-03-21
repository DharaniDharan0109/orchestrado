
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
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useToolStore, { ToolType } from '@/store/toolStore';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  tool: ToolType;
  active: boolean;
  onClick: (tool: ToolType) => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, tool, active, onClick }) => (
  <Button 
    variant={active ? "default" : "outline"}
    className={`flex flex-col items-center gap-1 p-3 h-auto ${active ? 'bg-primary text-primary-foreground' : ''}`}
    onClick={() => onClick(tool)}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </Button>
);

const DrawerTools: React.FC = () => {
  const { toast } = useToast();
  const { activeTool, setActiveTool } = useToolStore();
  
  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
    toast({
      title: "Tool Selected",
      description: `${tool} tool activated`,
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
          Tools
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-none">
        <DrawerHeader className="text-center">
          <DrawerTitle>Architecture Drawing Tools</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex justify-center gap-4 p-4 flex-wrap">
          <ToolButton 
            icon={<HandMetal size={24} />} 
            label="Select" 
            tool="select"
            active={activeTool === 'select'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<Link size={24} />} 
            label="Connector" 
            tool="connector"
            active={activeTool === 'connector'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<Circle size={24} />} 
            label="Circle" 
            tool="circle"
            active={activeTool === 'circle'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<Square size={24} />} 
            label="Square" 
            tool="square"
            active={activeTool === 'square'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<RectangleHorizontal size={24} />} 
            label="Rectangle" 
            tool="rectangle"
            active={activeTool === 'rectangle'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<Triangle size={24} />} 
            label="Triangle" 
            tool="triangle"
            active={activeTool === 'triangle'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<Pencil size={24} />} 
            label="Draw" 
            tool="draw"
            active={activeTool === 'draw'}
            onClick={handleToolSelect}
          />
          <ToolButton 
            icon={<Eraser size={24} />} 
            label="Erase" 
            tool="erase"
            active={activeTool === 'erase'}
            onClick={handleToolSelect}
          />
        </div>
        
        <DrawerFooter className="text-center text-sm text-muted-foreground">
          {activeTool === 'select' ? 'Click to select nodes or agents' : 
           activeTool === 'draw' ? 'Click and drag to draw on the canvas' : 
           activeTool === 'erase' ? 'Click on elements to erase them' : 
           'Click on the canvas to place the selected shape'}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerTools;
