
import { useState, useEffect } from 'react';
import useFlowStore from '@/store/flowStore';
import { useToast } from "@/hooks/use-toast";
import { AgentNode } from '@/store/types/agentTypes';

export const usePropertyEditor = () => {
  const { selectedNode, updateNodeConfig, updateNodeStatus } = useFlowStore();
  const [localConfig, setLocalConfig] = useState<any>({});
  const { toast } = useToast();

  // Update local config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setLocalConfig(selectedNode.data.config);
    }
  }, [selectedNode]);

  // Handle save config
  const handleSaveConfig = () => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, localConfig);
      toast({
        title: "Configuration Saved",
        description: `Updated settings for ${selectedNode.data.label}.`,
        duration: 3000,
      });
    }
  };

  // Handle execute agent
  const handleExecute = () => {
    if (selectedNode) {
      updateNodeStatus(selectedNode.id, 'running');
      
      // Simulate agent execution
      setTimeout(() => {
        // 80% chance of success
        const success = Math.random() > 0.2;
        updateNodeStatus(selectedNode.id, success ? 'success' : 'error');
        
        toast({
          title: success ? "Agent Executed Successfully" : "Agent Execution Failed",
          description: success 
            ? `${selectedNode.data.label} completed its task.` 
            : `${selectedNode.data.label} encountered an error.`,
          variant: success ? "default" : "destructive",
          duration: 3000,
        });
      }, 2000);
    }
  };

  // Input change handler
  const handleInputChange = (key: string, value: any) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    selectedNode,
    localConfig,
    handleInputChange,
    handleSaveConfig,
    handleExecute
  };
};
