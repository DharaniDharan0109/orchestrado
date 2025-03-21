
import React from 'react';
import { AgentType } from '@/store/types/agentTypes';
import ScraperAgentForm from './agent-forms/ScraperAgentForm';
import NlpAgentForm from './agent-forms/NlpAgentForm';
import FactCheckAgentForm from './agent-forms/FactCheckAgentForm';
import BlockchainAgentForm from './agent-forms/BlockchainAgentForm';
import CustomAgentForm from './agent-forms/CustomAgentForm';

interface AgentFormSelectorProps {
  agentType: AgentType;
  localConfig: any;
  handleInputChange: (key: string, value: any) => void;
}

const AgentFormSelector: React.FC<AgentFormSelectorProps> = ({ 
  agentType, 
  localConfig, 
  handleInputChange 
}) => {
  switch (agentType) {
    case 'scraperAgent':
      return <ScraperAgentForm localConfig={localConfig} handleInputChange={handleInputChange} />;
    
    case 'nlpAgent':
      return <NlpAgentForm localConfig={localConfig} handleInputChange={handleInputChange} />;
    
    case 'factCheckAgent':
      return <FactCheckAgentForm localConfig={localConfig} handleInputChange={handleInputChange} />;
    
    case 'blockchainAgent':
      return <BlockchainAgentForm localConfig={localConfig} handleInputChange={handleInputChange} />;
    
    case 'customAgent':
      return <CustomAgentForm localConfig={localConfig} handleInputChange={handleInputChange} />;
    
    default:
      return (
        <div className="text-center py-4 text-muted-foreground">
          No configuration options available for this agent.
        </div>
      );
  }
};

export default AgentFormSelector;
