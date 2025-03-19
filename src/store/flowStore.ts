
import { create } from 'zustand';
import { 
  Edge, 
  Node, 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  Connection,
  addEdge
} from '@xyflow/react';
import { nanoid } from 'nanoid';

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

// Store state interface
interface FlowState {
  nodes: AgentNode[];
  edges: Edge[];
  selectedNode: AgentNode | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: AgentType, position: { x: number, y: number }) => void;
  updateNodeConfig: (nodeId: string, config: AgentConfig) => void;
  updateNodeStatus: (nodeId: string, status: 'idle' | 'running' | 'success' | 'error') => void;
  setSelectedNode: (nodeId: string | null) => void;
  saveFlow: () => void;
  loadFlow: () => void;
  resetFlow: () => void;
}

// Initial nodes setup
const initialNodes: AgentNode[] = [];

// Initial edges setup
const initialEdges: Edge[] = [];

// Create the store
const useFlowStore = create<FlowState>((set, get) => ({
  // Initial state
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,

  // Node changes handler
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as AgentNode[],
    });
  },

  // Edge changes handler
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  // Connection handler
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          id: `e-${nanoid()}`,
          animated: true,
          style: { stroke: '#929292' },
        },
        get().edges
      ),
    });
  },

  // Add a new node
  addNode: (type: AgentType, position: { x: number, y: number }) => {
    const nodeId = `${type}-${nanoid()}`;
    
    // Define default configurations based on node type
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

    // Create node labels based on type
    const labels: Record<AgentType, string> = {
      scraperAgent: 'Web Scraper',
      nlpAgent: 'NLP Processor',
      factCheckAgent: 'Fact Checker',
      blockchainAgent: 'Blockchain Logger',
      customAgent: 'Custom Agent'
    };

    const newNode: AgentNode = {
      id: nodeId,
      type,
      position,
      data: {
        label: labels[type],
        type: type,
        status: 'idle',
        config: defaultConfigs[type]
      }
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  // Update node configuration
  updateNodeConfig: (nodeId: string, config: AgentConfig) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...node.data.config,
                ...config
              }
            }
          };
        }
        return node;
      })
    });
  },

  // Update node status
  updateNodeStatus: (nodeId: string, status: 'idle' | 'running' | 'success' | 'error') => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              status
            }
          };
        }
        return node;
      })
    });
  },

  // Set selected node
  setSelectedNode: (nodeId: string | null) => {
    if (nodeId === null) {
      set({ selectedNode: null });
    } else {
      const node = get().nodes.find(n => n.id === nodeId);
      set({ selectedNode: node || null });
    }
  },

  // Save flow to localStorage
  saveFlow: () => {
    const { nodes, edges } = get();
    localStorage.setItem('orchestrator-flow', JSON.stringify({ nodes, edges }));
  },

  // Load flow from localStorage
  loadFlow: () => {
    const savedFlow = localStorage.getItem('orchestrator-flow');
    if (savedFlow) {
      try {
        const { nodes, edges } = JSON.parse(savedFlow);
        set({ nodes, edges });
      } catch (error) {
        console.error('Failed to load saved flow:', error);
      }
    }
  },

  // Reset the flow
  resetFlow: () => {
    set({ 
      nodes: [], 
      edges: [],
      selectedNode: null
    });
  }
}));

export default useFlowStore;
