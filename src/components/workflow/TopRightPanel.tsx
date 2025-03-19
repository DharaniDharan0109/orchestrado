
import React from 'react';
import { Panel } from '@xyflow/react';
import { Play, Save, FileDown, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkflowGenerator from '@/components/WorkflowGenerator';
import { useToast } from '@/hooks/use-toast';
import useFlowStore from '@/store/flowStore';

const TopRightPanel = () => {
  const { nodes, edges, saveFlow } = useFlowStore();
  const { toast } = useToast();

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

    nodes.forEach((node, index) => {
      setTimeout(() => {
        useFlowStore.getState().updateNodeStatus(node.id, 'running');
        
        setTimeout(() => {
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
      }, index * 700);
    });
  };

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

  return (
    <Panel position="top-right" className="flex gap-2 mt-4 mr-4">
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
  );
};

export default TopRightPanel;
