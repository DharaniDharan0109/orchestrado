
import React from 'react';
import { X, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePropertyEditor } from '@/hooks/usePropertyEditor';
import AgentFormSelector from './property-editor/AgentFormSelector';

interface PropertyEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ isOpen, onClose }) => {
  const {
    selectedNode,
    localConfig,
    handleInputChange,
    handleSaveConfig,
    handleExecute
  } = usePropertyEditor();

  return (
    <div className={`property-editor ${isOpen ? '' : 'closed'}`}>
      <div className="property-editor-header">
        <h2 className="text-lg font-semibold">
          {selectedNode?.data.label || 'Agent'} Configuration
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
      
      <div className="property-editor-body">
        {selectedNode ? (
          <AgentFormSelector 
            agentType={selectedNode.data.type} 
            localConfig={localConfig} 
            handleInputChange={handleInputChange} 
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Select an agent to configure it.
          </div>
        )}
      </div>
      
      {selectedNode && (
        <div className="property-editor-footer flex justify-between">
          <Button variant="default" onClick={handleExecute} className="flex items-center gap-2">
            <Play size={16} />
            Execute Agent
          </Button>
          <Button variant="outline" onClick={handleSaveConfig} className="flex items-center gap-2">
            <Save size={16} />
            Save Config
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyEditor;
