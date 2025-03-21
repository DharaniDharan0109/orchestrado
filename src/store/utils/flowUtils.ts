
import { XYPosition } from '@xyflow/react';
import { AgentType, AgentConfig, AgentNode } from '../types/agentTypes';
import { nanoid } from 'nanoid';

// Function to snap position to grid
export const snapToGrid = (position: XYPosition, snap: boolean, grid: [number, number]): XYPosition => {
  if (!snap) return position;
  
  return {
    x: Math.round(position.x / grid[0]) * grid[0],
    y: Math.round(position.y / grid[1]) * grid[1]
  };
};

// Get default configurations for different node types
export const getDefaultConfig = (type: AgentType): AgentConfig => {
  const defaultConfigs: Record<AgentType, AgentConfig> = {
    scraperAgent: { 
      url: 'https://example.com',
      selectors: { title: 'h1', content: '.article-content' },
      interval: 60
    },
    nlpAgent: {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000
    },
    factCheckAgent: {
      apiKey: '',
      threshold: 0.7,
      sources: ['trusted-source-1', 'trusted-source-2']
    },
    blockchainAgent: {
      network: 'ethereum',
      contract: '',
      wallet: ''
    },
    customAgent: {
      name: 'Custom Agent',
      code: '// Your custom logic here\nconsole.log("Custom agent running");'
    }
  };

  return defaultConfigs[type];
};

// Get labels for different agent types
export const getAgentLabel = (type: AgentType): string => {
  const labels: Record<AgentType, string> = {
    scraperAgent: 'Web Scraper',
    nlpAgent: 'NLP Processor',
    factCheckAgent: 'Fact Checker',
    blockchainAgent: 'Blockchain Logger',
    customAgent: 'Custom Agent'
  };

  return labels[type];
};

// Create a new agent node
export const createAgentNode = (type: AgentType, position: XYPosition): AgentNode => {
  const nodeId = `${type}-${nanoid()}`;
  
  return {
    id: nodeId,
    type,
    position,
    data: {
      label: getAgentLabel(type),
      type: type,
      status: 'idle',
      config: getDefaultConfig(type)
    }
  };
};

// Get recommended agent types based on current node type
export const getRecommendedAgents = (currentType: AgentType): AgentType[] => {
  const recommendations: Record<AgentType, AgentType[]> = {
    scraperAgent: ['nlpAgent', 'factCheckAgent'],
    nlpAgent: ['factCheckAgent', 'blockchainAgent'],
    factCheckAgent: ['blockchainAgent'],
    blockchainAgent: ['customAgent'],
    customAgent: ['scraperAgent', 'nlpAgent', 'factCheckAgent', 'blockchainAgent']
  };
  
  return recommendations[currentType];
};
