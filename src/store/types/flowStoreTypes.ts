
import { NodeChange, EdgeChange, Connection, XYPosition, Edge } from '@xyflow/react';
import { AgentNode, AgentType, HistoryState } from './agentTypes';

// Store state interface
export interface FlowState {
  nodes: AgentNode[];
  edges: Edge[];
  selectedNode: AgentNode | null;
  gridSnap: boolean;
  snapGrid: [number, number];
  history: HistoryState[];
  historyIndex: number;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: AgentType, position: { x: number, y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  updateNodeStatus: (nodeId: string, status: 'idle' | 'running' | 'success' | 'error') => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleGridSnap: () => void;
  saveFlow: () => void;
  loadFlow: () => void;
  resetFlow: () => void;
  undo: () => void;
  redo: () => void;
  saveHistoryState: () => void;
  autoGenerateWorkflow: (description: string) => void;
  getRecommendedAgents: (currentNodeId: string) => AgentType[];
}
