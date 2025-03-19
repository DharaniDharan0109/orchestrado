
import React from 'react';
import { Panel } from '@xyflow/react';
import WorkflowGenerator from '@/components/WorkflowGenerator';

const EmptyWorkflowMessage = () => {
  return (
    <Panel position="top-center" className="mt-10">
      <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border shadow-md text-center max-w-lg animate-fade-in">
        <h3 className="text-lg font-semibold mb-2">Welcome to AI Workflow Orchestrator</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag agents from the sidebar onto this canvas to create your AI workflow.
          Connect agents together to build powerful automation pipelines.
        </p>
        <div className="flex justify-center">
          <WorkflowGenerator />
        </div>
      </div>
    </Panel>
  );
};

export default EmptyWorkflowMessage;
