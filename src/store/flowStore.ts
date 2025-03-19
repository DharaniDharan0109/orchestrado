
import { create } from 'zustand';
import { 
  Edge, 
  Node, 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  Connection,
  addEdge,
  XYPosition
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

// History states for undo/redo functionality
interface HistoryState {
  nodes: AgentNode[];
  edges: Edge[];
}

// Store state interface
interface FlowState {
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
  updateNodeConfig: (nodeId: string, config: AgentConfig) => void;
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

// Initial nodes setup
const initialNodes: AgentNode[] = [];

// Initial edges setup
const initialEdges: Edge[] = [];

// Function to snap position to grid
const snapToGrid = (position: XYPosition, snap: boolean, grid: [number, number]): XYPosition => {
  if (!snap) return position;
  
  return {
    x: Math.round(position.x / grid[0]) * grid[0],
    y: Math.round(position.y / grid[1]) * grid[1]
  };
};

// Create the store
const useFlowStore = create<FlowState>((set, get) => ({
  // Initial state
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  gridSnap: true,
  snapGrid: [20, 20],
  history: [],
  historyIndex: -1,

  // Node changes handler
  onNodesChange: (changes: NodeChange[]) => {
    const { gridSnap, snapGrid } = get();

    // Handle position changes for grid snapping
    const updatedChanges = changes.map(change => {
      if (change.type === 'position' && gridSnap && change.position) {
        return {
          ...change,
          position: snapToGrid(change.position, gridSnap, snapGrid)
        };
      }
      return change;
    });

    set({
      nodes: applyNodeChanges(updatedChanges, get().nodes) as AgentNode[],
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
    // Store the current state for undo/redo
    get().saveHistoryState();

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
    // Store the current state for undo/redo
    get().saveHistoryState();

    const { gridSnap, snapGrid } = get();
    const snappedPosition = snapToGrid(position, gridSnap, snapGrid);
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
      position: snappedPosition,
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
    // Store the current state for undo/redo
    get().saveHistoryState();

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

  // Toggle grid snap
  toggleGridSnap: () => {
    set(state => ({ gridSnap: !state.gridSnap }));
  },

  // Save history state for undo/redo
  saveHistoryState: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  // Undo the last action
  undo: () => {
    const { historyIndex, history } = get();
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { nodes, edges } = history[newIndex];
      
      set({
        historyIndex: newIndex,
        nodes: nodes,
        edges: edges
      });
    }
  },

  // Redo the previously undone action
  redo: () => {
    const { historyIndex, history } = get();
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { nodes, edges } = history[newIndex];
      
      set({
        historyIndex: newIndex,
        nodes: nodes,
        edges: edges
      });
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
        // Save the current state before loading
        get().saveHistoryState();
        set({ nodes, edges });
      } catch (error) {
        console.error('Failed to load saved flow:', error);
      }
    }
  },

  // Reset the flow
  resetFlow: () => {
    // Save the current state before resetting
    get().saveHistoryState();
    
    set({ 
      nodes: [], 
      edges: [],
      selectedNode: null
    });
  },

  // Auto-generate workflow based on natural language description
  autoGenerateWorkflow: (description: string) => {
    // Save the current state before generating
    get().saveHistoryState();
    
    // Reset current flow
    set({ nodes: [], edges: [] });
    
    // Simple NLP-based workflow generation logic
    const scrape = /scrape|extract|get data|collect|crawl|fetch/i;
    const nlp = /nlp|process|analyze|understand|language|text/i;
    const factCheck = /fact|check|verify|validate|confirm/i;
    const blockchain = /blockchain|log|record|store|save|ledger/i;
    
    const nodes: AgentNode[] = [];
    const edges: Edge[] = [];
    
    let xPosition = 100;
    const yPosition = 100;
    let lastNodeId = '';
    
    // Add scraper if needed
    if (scrape.test(description)) {
      const nodeId = `scraperAgent-${nanoid()}`;
      nodes.push({
        id: nodeId,
        type: 'scraperAgent',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'Web Scraper',
          type: 'scraperAgent',
          status: 'idle',
          config: {
            url: 'https://example.com',
            selectors: { title: 'h1', content: '.article-content' },
            interval: 60
          }
        }
      });
      lastNodeId = nodeId;
      xPosition += 200;
    }
    
    // Add NLP if needed
    if (nlp.test(description)) {
      const nodeId = `nlpAgent-${nanoid()}`;
      nodes.push({
        id: nodeId,
        type: 'nlpAgent',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'NLP Processor',
          type: 'nlpAgent',
          status: 'idle',
          config: {
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 1000
          }
        }
      });
      
      // Connect to previous node if exists
      if (lastNodeId) {
        edges.push({
          id: `e-${nanoid()}`,
          source: lastNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#929292' }
        });
      }
      
      lastNodeId = nodeId;
      xPosition += 200;
    }
    
    // Add fact checker if needed
    if (factCheck.test(description)) {
      const nodeId = `factCheckAgent-${nanoid()}`;
      nodes.push({
        id: nodeId,
        type: 'factCheckAgent',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'Fact Checker',
          type: 'factCheckAgent',
          status: 'idle',
          config: {
            apiKey: '',
            threshold: 0.7,
            sources: ['trusted-source-1', 'trusted-source-2']
          }
        }
      });
      
      // Connect to previous node if exists
      if (lastNodeId) {
        edges.push({
          id: `e-${nanoid()}`,
          source: lastNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#929292' }
        });
      }
      
      lastNodeId = nodeId;
      xPosition += 200;
    }
    
    // Add blockchain if needed
    if (blockchain.test(description)) {
      const nodeId = `blockchainAgent-${nanoid()}`;
      nodes.push({
        id: nodeId,
        type: 'blockchainAgent',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'Blockchain Logger',
          type: 'blockchainAgent',
          status: 'idle',
          config: {
            network: 'ethereum',
            contract: '',
            wallet: ''
          }
        }
      });
      
      // Connect to previous node if exists
      if (lastNodeId) {
        edges.push({
          id: `e-${nanoid()}`,
          source: lastNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#929292' }
        });
      }
    }
    
    set({ nodes, edges });
  },

  // Get recommended next agent types based on the current node
  getRecommendedAgents: (currentNodeId: string): AgentType[] => {
    const { nodes } = get();
    const currentNode = nodes.find(node => node.id === currentNodeId);
    
    if (!currentNode) return [];
    
    // Define recommended agent sequences
    const recommendations: Record<AgentType, AgentType[]> = {
      scraperAgent: ['nlpAgent', 'factCheckAgent'],
      nlpAgent: ['factCheckAgent', 'blockchainAgent'],
      factCheckAgent: ['blockchainAgent'],
      blockchainAgent: ['customAgent'],
      customAgent: ['scraperAgent', 'nlpAgent', 'factCheckAgent', 'blockchainAgent']
    };
    
    return recommendations[currentNode.data.type];
  }
}));

export default useFlowStore;
