
import React, { useState } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from '@/components/Sidebar';
import PropertyEditor from '@/components/PropertyEditor';
import FlowCanvas from '@/components/workflow/FlowCanvas';
import DrawerTools from '@/components/workflow/DrawerTools';

const Index = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState<string | null>(null);

  const onNodeClick = (nodeId: string) => {
    if (nodeId) {
      setShowEditor(true);
      setShowRecommendations(nodeId);
    } else {
      setShowEditor(false);
      setShowRecommendations(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 relative">
        <FlowCanvas 
          onNodeClick={onNodeClick}
          showRecommendations={showRecommendations}
        />
        <DrawerTools />
      </div>
      
      <PropertyEditor 
        isOpen={showEditor && showRecommendations !== null} 
        onClose={() => setShowEditor(false)} 
      />
    </div>
  );
};

const FlowWithProvider = () => {
  return (
    <ReactFlow>
      <Index />
    </ReactFlow>
  );
};

export default FlowWithProvider;
