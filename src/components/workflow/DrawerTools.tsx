
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

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, onClick }) => (
  <Button 
    variant="outline" 
    className="flex flex-col items-center gap-1 p-3 h-auto"
    onClick={onClick}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </Button>
);

const DrawerTools: React.FC = () => {
  const { toast } = useToast();
  
  const handleToolSelect = (tool: string) => {
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
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 rounded-full px-6"
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Tools
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-none">
        <DrawerHeader className="text-center">
          <DrawerTitle>Drawing Tools</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex justify-center gap-4 p-4">
          <ToolButton 
            icon={<HandMetal size={24} />} 
            label="Select" 
            onClick={() => handleToolSelect("Select")}
          />
          <ToolButton 
            icon={<Link size={24} />} 
            label="Connector" 
            onClick={() => handleToolSelect("Connector")}
          />
          <ToolButton 
            icon={<Circle size={24} />} 
            label="Circle" 
            onClick={() => handleToolSelect("Circle")}
          />
          <ToolButton 
            icon={<Square size={24} />} 
            label="Square" 
            onClick={() => handleToolSelect("Square")}
          />
          <ToolButton 
            icon={<RectangleHorizontal size={24} />} 
            label="Rectangle" 
            onClick={() => handleToolSelect("Rectangle")}
          />
          <ToolButton 
            icon={<Triangle size={24} />} 
            label="Triangle" 
            onClick={() => handleToolSelect("Triangle")}
          />
          <ToolButton 
            icon={<Pencil size={24} />} 
            label="Draw" 
            onClick={() => handleToolSelect("Draw")}
          />
          <ToolButton 
            icon={<Eraser size={24} />} 
            label="Erase" 
            onClick={() => handleToolSelect("Erase")}
          />
        </div>
        
        <DrawerFooter className="text-center text-sm text-muted-foreground">
          Drag and drop shapes onto the canvas
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerTools;
