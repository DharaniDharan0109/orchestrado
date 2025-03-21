
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import FormField from '../FormField';

interface NlpAgentFormProps {
  localConfig: any;
  handleInputChange: (key: string, value: any) => void;
}

const NlpAgentForm: React.FC<NlpAgentFormProps> = ({ localConfig, handleInputChange }) => {
  return (
    <>
      <FormField label="AI Model" htmlFor="model">
        <select
          id="model"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={localConfig.model || 'gpt-4o-mini'}
          onChange={(e) => handleInputChange('model', e.target.value)}
        >
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="bert-base">BERT Base</option>
          <option value="bert-large">BERT Large</option>
          <option value="llama2">Llama 2</option>
        </select>
      </FormField>
      
      <FormField 
        label="Temperature" 
        htmlFor="temperature"
        description="Higher values make output more random (0-1)"
      >
        <div className="pt-2 pb-4">
          <Slider
            defaultValue={[localConfig.temperature || 0.7]}
            max={1}
            step={0.1}
            onValueChange={(value) => handleInputChange('temperature', value[0])}
          />
          <div className="text-xs text-right mt-1">
            {localConfig.temperature || 0.7}
          </div>
        </div>
      </FormField>
      
      <FormField 
        label="Max Tokens" 
        htmlFor="maxTokens"
        description="Maximum length of generated text"
      >
        <Input
          id="maxTokens"
          type="number"
          min="1"
          max="4000"
          value={localConfig.maxTokens || 1000}
          onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
        />
      </FormField>
      
      <FormField 
        label="System Prompt" 
        htmlFor="prompt"
        description="Instructions for the AI model"
      >
        <Textarea
          id="prompt"
          value={localConfig.prompt || "You are a helpful assistant analyzing text."}
          onChange={(e) => handleInputChange('prompt', e.target.value)}
          className="min-h-[80px]"
        />
      </FormField>
    </>
  );
};

export default NlpAgentForm;
