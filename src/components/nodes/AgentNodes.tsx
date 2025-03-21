import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  FileSearch, 
  BrainCircuit, 
  ShieldCheck, 
  Database, 
  Code, 
  Check, 
  AlertTriangle, 
  Loader2
} from 'lucide-react';
import { AgentType } from '@/store/types/agentTypes';

// Status icon component
const StatusIcon = ({ status }: { status?: 'idle' | 'running' | 'success' | 'error' }) => {
  switch(status) {
    case 'running':
      return <Loader2 size={16} className="animate-spin text-primary" />;
    case 'success':
      return <Check size={16} className="text-green-500" />;
    case 'error':
      return <AlertTriangle size={16} className="text-red-500" />;
    default:
      return null;
  }
};

// Agent icon component
const AgentIcon = ({ type }: { type: AgentType }) => {
  switch(type) {
    case 'scraperAgent':
      return <FileSearch size={18} className="text-[hsl(var(--scraper-color))]" />;
    case 'nlpAgent':
      return <BrainCircuit size={18} className="text-[hsl(var(--nlp-color))]" />;
    case 'factCheckAgent':
      return <ShieldCheck size={18} className="text-[hsl(var(--factcheck-color))]" />;
    case 'blockchainAgent':
      return <Database size={18} className="text-[hsl(var(--blockchain-color))]" />;
    case 'customAgent':
      return <Code size={18} className="text-[hsl(var(--custom-color))]" />;
    default:
      return null;
  }
};

// Base agent node props
interface AgentNodeProps {
  data: {
    label: string;
    type: AgentType;
    status?: 'idle' | 'running' | 'success' | 'error';
    config: Record<string, any>;
  };
  id: string;
  selected: boolean;
}

// Base agent node component
const BaseAgentNode: React.FC<AgentNodeProps> = ({ data, id, selected }) => {
  // Get node class based on agent type
  const getNodeClass = () => {
    return `agent-node node-${data.type.replace('Agent', '')}`;
  };

  return (
    <div className={getNodeClass()}>
      <Handle type="target" position={Position.Top} id="in" />
      
      <div className="agent-node-header">
        <AgentIcon type={data.type} />
        <span className="font-medium">{data.label}</span>
      </div>
      
      <div className="agent-node-body">
        {data.type === 'scraperAgent' && (
          <div className="text-xs opacity-75 truncate">
            URL: {data.config?.url || 'Not set'}
          </div>
        )}
        
        {data.type === 'nlpAgent' && (
          <div className="text-xs opacity-75 truncate">
            Model: {data.config?.model || 'Not set'}
          </div>
        )}
        
        {data.type === 'factCheckAgent' && (
          <div className="text-xs opacity-75 truncate">
            Threshold: {data.config?.threshold || 'Not set'}
          </div>
        )}
        
        {data.type === 'blockchainAgent' && (
          <div className="text-xs opacity-75 truncate">
            Network: {data.config?.network || 'Not set'}
          </div>
        )}
        
        {data.type === 'customAgent' && (
          <div className="text-xs opacity-75 truncate">
            {data.config?.name || 'Custom Logic'}
          </div>
        )}
      </div>
      
      <div className="agent-node-footer">
        <span className="text-xs opacity-60">ID: {id.split('-')[1]?.substring(0, 5) || id}</span>
        <StatusIcon status={data.status} />
      </div>
      
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
};

// Define individual agent nodes by extending the base component
export const ScraperAgentNode = memo(BaseAgentNode);
export const NlpAgentNode = memo(BaseAgentNode);
export const FactCheckAgentNode = memo(BaseAgentNode);
export const BlockchainAgentNode = memo(BaseAgentNode);
export const CustomAgentNode = memo(BaseAgentNode);

// Export node types object for React Flow
export const nodeTypes = {
  scraperAgent: ScraperAgentNode,
  nlpAgent: NlpAgentNode,
  factCheckAgent: FactCheckAgentNode,
  blockchainAgent: BlockchainAgentNode,
  customAgent: CustomAgentNode
};

// Export agent config panels
export const getAgentDescription = (type: AgentType): string => {
  switch(type) {
    case 'scraperAgent':
      return 'Extracts data from websites using specified selectors.';
    case 'nlpAgent':
      return 'Processes text using AI models for analysis and understanding.';
    case 'factCheckAgent':
      return 'Verifies information against trusted sources and databases.';
    case 'blockchainAgent':
      return 'Records verified data to blockchain networks.';
    case 'customAgent':
      return 'Create your own agent with custom code and logic.';
    default:
      return '';
  }
};
