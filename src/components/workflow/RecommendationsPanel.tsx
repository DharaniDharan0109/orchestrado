
import React from 'react';
import { Panel } from '@xyflow/react';
import RecommendedAgents from '@/components/RecommendedAgents';

interface RecommendationsPanelProps {
  nodeId: string | null;
}

const RecommendationsPanel = ({ nodeId }: RecommendationsPanelProps) => {
  if (!nodeId) return null;
  
  return (
    <Panel position="bottom" className="flex justify-center w-full mb-8">
      <div className="mx-auto">
        <RecommendedAgents nodeId={nodeId} />
      </div>
    </Panel>
  );
};

export default RecommendationsPanel;
