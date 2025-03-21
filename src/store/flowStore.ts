
import { create } from 'zustand';
import { 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  Connection,
  addEdge
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { AgentNode, AgentType, Edge } from './types/agentTypes';
import { FlowState } from './types/flowStoreTypes';
import { snapToGrid, createAgentNode, getRecommendedAgents } from './utils/flowUtils';
import { generateWorkflow } from './utils/workflowGenerator';

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
    const newNode = createAgentNode(type, snappedPosition);

    set({ nodes: [...get().nodes, newNode] });
  },

  // Update node configuration
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => {
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
    
    // Generate workflow based on description
    const { nodes, edges } = generateWorkflow(description);
    
    set({ nodes, edges });
  },

  // Get recommended next agent types based on the current node
  getRecommendedAgents: (currentNodeId: string): AgentType[] => {
    const { nodes } = get();
    const currentNode = nodes.find(node => node.id === currentNodeId);
    
    if (!currentNode) return [];
    
    return getRecommendedAgents(currentNode.data.type);
  }
}));

// Re-export types for convenience - fixing the 'isolatedModules' TypeScript error
export type { AgentType, AgentNode } from './types/agentTypes';
export default useFlowStore;
