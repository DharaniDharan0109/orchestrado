
import React from 'react';
import { Panel } from '@xyflow/react';
import { Undo2, Redo2, Grid, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useFlowStore from '@/store/flowStore';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const BottomLeftPanel = () => {
  const { undo, redo, gridSnap, toggleGridSnap, resetFlow } = useFlowStore();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeToggle = () => {
    toggleTheme();
    toast({
      title: theme === 'light' ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: "UI theme has been updated.",
    });
  };

  return (
    <Panel position="bottom-left" className="flex gap-2 mb-4 ml-4">
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
  );
};

export default BottomLeftPanel;
