
import React from 'react';
import { Lightbulb } from 'lucide-react';
import useFlowStore, { AgentType } from '@/store/flowStore';
import { getAgentDescription } from '@/components/nodes/AgentNodes';
import { useToast } from '@/hooks/use-toast';

interface RecommendedAgentsProps {
  nodeId: string;
}

const RecommendedAgents: React.FC<RecommendedAgentsProps> = ({ nodeId }) => {
  const { getRecommendedAgents, addNode, nodes } = useFlowStore();
  const { toast } = useToast();
  const recommendedAgents = getRecommendedAgents(nodeId);
  
  if (recommendedAgents.length === 0) return null;
  
  const handleAddRecommended = (type: AgentType) => {
    // Find the source node position
    const sourceNode = nodes.find(node => node.id === nodeId);
    if (!sourceNode) return;
    
    // Calculate new position (to the right and slightly below)
    const position = {
      x: sourceNode.position.x + 250,
      y: sourceNode.position.y + 50
    };
    
    // Add the new node
    addNode(type, position);
    
    toast({
      title: "Agent Added",
      description: `Added recommended ${type.replace('Agent', '')} agent to your workflow.`,
    });
  };
  
  // Get icon based on agent type
  const getIcon = (type: AgentType) => {
    return <div className={`w-2 h-2 rounded-full bg-[hsl(var(--${type.replace('Agent', '')}-color))]`}></div>;
  };

  return (
    <div className="recommended-agents slide-in py-2 px-3 bg-card/80 backdrop-blur-sm border rounded-lg shadow-sm">
      <div className="flex items-center gap-1 mb-2 text-xs font-medium">
        <Lightbulb size={14} className="text-amber-400" />
        <span>Recommended Next Steps</span>
      </div>
      
      <div className="space-y-1">
        {recommendedAgents.map((agentType) => (
          <button
            key={agentType}
            onClick={() => handleAddRecommended(agentType)}
            className="w-full text-left flex items-center gap-2 p-1.5 text-xs rounded hover:bg-muted/50 transition-colors"
          >
            {getIcon(agentType)}
            <div>
              <div className="font-medium">{agentType.replace('Agent', '')}</div>
              <div className="text-xxs text-muted-foreground truncate max-w-[200px]">
                {getAgentDescription(agentType)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedAgents;
