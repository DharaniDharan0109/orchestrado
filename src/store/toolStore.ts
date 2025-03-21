
import { create } from 'zustand';

export type ToolType = 'select' | 'connector' | 'circle' | 'square' | 'rectangle' | 'triangle' | 'draw' | 'erase';

interface ToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  lastUsedTool: ToolType | null;
  setLastUsedTool: (tool: ToolType | null) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool: ToolType) => set({ activeTool: tool }),
  lastUsedTool: null,
  setLastUsedTool: (tool: ToolType | null) => set({ lastUsedTool: tool }),
  isDragging: false,
  setIsDragging: (isDragging: boolean) => set({ isDragging }),
}));

export default useToolStore;
