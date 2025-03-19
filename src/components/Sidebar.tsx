
import React from 'react';
import { FileSearch, BrainCircuit, ShieldCheck, Database, Code, Save, Upload, Trash2 } from 'lucide-react';
import useFlowStore, { AgentType } from '@/store/flowStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { getAgentDescription } from './nodes/AgentNodes';

interface AgentItemProps {
  type: AgentType;
  label: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: AgentType) => void;
}

const AgentItem: React.FC<AgentItemProps> = ({ type, label, onDragStart }) => {
  // Get icon based on agent type
  const getIcon = () => {
    switch(type) {
      case 'scraperAgent':
        return <FileSearch size={20} className="text-[hsl(var(--scraper-color))]" />;
      case 'nlpAgent':
        return <BrainCircuit size={20} className="text-[hsl(var(--nlp-color))]" />;
      case 'factCheckAgent':
        return <ShieldCheck size={20} className="text-[hsl(var(--factcheck-color))]" />;
      case 'blockchainAgent':
        return <Database size={20} className="text-[hsl(var(--blockchain-color))]" />;
      case 'customAgent':
        return <Code size={20} className="text-[hsl(var(--custom-color))]" />;
      default:
        return null;
    }
  };

  // Get class based on agent type
  const getClass = () => {
    switch(type) {
      case 'scraperAgent':
        return 'border-[hsl(var(--scraper-color)/30%)] hover:bg-[hsl(var(--scraper-color)/5%)]';
      case 'nlpAgent':
        return 'border-[hsl(var(--nlp-color)/30%)] hover:bg-[hsl(var(--nlp-color)/5%)]';
      case 'factCheckAgent':
        return 'border-[hsl(var(--factcheck-color)/30%)] hover:bg-[hsl(var(--factcheck-color)/5%)]';
      case 'blockchainAgent':
        return 'border-[hsl(var(--blockchain-color)/30%)] hover:bg-[hsl(var(--blockchain-color)/5%)]';
      case 'customAgent':
        return 'border-[hsl(var(--custom-color)/30%)] hover:bg-[hsl(var(--custom-color)/5%)]';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`agent-item ${getClass()}`}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      {getIcon()}
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
          {getAgentDescription(type)}
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { saveFlow, loadFlow, resetFlow, nodes, edges } = useFlowStore();
  const { toast } = useToast();

  // Handle drag start
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: AgentType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle save flow
  const handleSaveFlow = () => {
    saveFlow();
    toast({
      title: "Workflow Saved",
      description: `Saved ${nodes.length} agents and ${edges.length} connections.`,
      duration: 3000,
    });
  };

  // Handle load flow
  const handleLoadFlow = () => {
    loadFlow();
    toast({
      title: "Workflow Loaded",
      description: "Successfully loaded the saved workflow.",
      duration: 3000,
    });
  };

  // Handle reset flow
  const handleResetFlow = () => {
    if (confirm("Are you sure you want to reset the entire workflow? This action cannot be undone.")) {
      resetFlow();
      toast({
        title: "Workflow Reset",
        description: "The workflow has been completely reset.",
        duration: 3000,
      });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="text-xl font-semibold">Agent Orchestrator</h1>
      </div>
      
      <h2 className="text-sm font-medium uppercase text-muted-foreground mb-1">Available Agents</h2>
      <div className="space-y-1">
        <AgentItem 
          type="scraperAgent" 
          label="Web Scraper" 
          onDragStart={onDragStart}
        />
        <AgentItem 
          type="nlpAgent" 
          label="NLP Processor" 
          onDragStart={onDragStart}
        />
        <AgentItem 
          type="factCheckAgent" 
          label="Fact Checker" 
          onDragStart={onDragStart}
        />
        <AgentItem 
          type="blockchainAgent" 
          label="Blockchain Logger" 
          onDragStart={onDragStart}
        />
        <AgentItem 
          type="customAgent" 
          label="Custom Agent" 
          onDragStart={onDragStart}
        />
      </div>
      
      <div className="mt-auto space-y-2 pt-4 border-t">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2" 
          onClick={handleSaveFlow}
        >
          <Save size={16} />
          Save Workflow
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2" 
          onClick={handleLoadFlow}
        >
          <Upload size={16} />
          Load Workflow
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 text-destructive hover:text-destructive" 
          onClick={handleResetFlow}
        >
          <Trash2 size={16} />
          Reset Workflow
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-4 text-center">
        Drag agents onto the canvas and connect them to build your workflow.
      </div>
    </aside>
  );
};

export default Sidebar;
