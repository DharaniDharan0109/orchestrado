
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import FormField from '../FormField';

interface CustomAgentFormProps {
  localConfig: any;
  handleInputChange: (key: string, value: any) => void;
}

const CustomAgentForm: React.FC<CustomAgentFormProps> = ({ localConfig, handleInputChange }) => {
  return (
    <>
      <FormField 
        label="Agent Name" 
        htmlFor="name"
        description="Display name for this custom agent"
      >
        <Input
          id="name"
          value={localConfig.name || 'Custom Agent'}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </FormField>
      
      <FormField 
        label="Custom Code" 
        htmlFor="code"
        description="JavaScript code to execute when this agent runs"
      >
        <div className="border rounded-md">
          <Textarea
            id="code"
            value={localConfig.code || '// Your custom logic here\nconsole.log("Custom agent running");'}
            onChange={(e) => handleInputChange('code', e.target.value)}
            className="font-mono text-xs min-h-[200px]"
          />
        </div>
      </FormField>
      
      <div className="flex items-center space-x-2 mt-4">
        <AlertTriangle size={14} className="text-yellow-500" />
        <span className="text-xs text-muted-foreground">
          Custom code executes in a sandbox environment
        </span>
      </div>
    </>
  );
};

export default CustomAgentForm;
