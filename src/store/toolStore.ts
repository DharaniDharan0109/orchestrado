
import { create } from 'zustand';

export type ToolType = 'select' | 'connector' | 'circle' | 'square' | 'rectangle' | 'triangle' | 'draw' | 'erase';

interface ToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool: ToolType) => set({ activeTool: tool }),
}));

export default useToolStore;
