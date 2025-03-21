
import { Node, Edge } from '@xyflow/react';

// Define the type for agent configurations
export interface AgentConfig {
  [key: string]: any;
}

// Define the agent types
export type AgentType = 'scraperAgent' | 'nlpAgent' | 'factCheckAgent' | 'blockchainAgent' | 'customAgent';

// Extended Node type with agent-specific properties
export interface AgentNode extends Node {
  data: {
    label: string;
    type: AgentType;
    status?: 'idle' | 'running' | 'success' | 'error';
    config: AgentConfig;
  };
}

// History states for undo/redo functionality
export interface HistoryState {
  nodes: AgentNode[];
  edges: Edge[];
}
