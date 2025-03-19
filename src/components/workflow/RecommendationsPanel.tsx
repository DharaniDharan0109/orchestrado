
import React from 'react';
import { Panel } from '@xyflow/react';
import RecommendedAgents from '@/components/RecommendedAgents';

interface RecommendationsPanelProps {
  nodeId: string | null;
}

const RecommendationsPanel = ({ nodeId }: RecommendationsPanelProps) => {
  if (!nodeId) return null;
  
  return (
    <Panel position="bottom-center" className="flex justify-center w-full mb-4">
      <RecommendedAgents nodeId={nodeId} />
    </Panel>
  );
};

export default RecommendationsPanel;
