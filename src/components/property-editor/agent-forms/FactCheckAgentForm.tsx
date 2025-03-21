
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FormField from '../FormField';

interface FactCheckAgentFormProps {
  localConfig: any;
  handleInputChange: (key: string, value: any) => void;
}

const FactCheckAgentForm: React.FC<FactCheckAgentFormProps> = ({ localConfig, handleInputChange }) => {
  return (
    <>
      <FormField 
        label="API Key" 
        htmlFor="apiKey"
        description="Authentication key for the fact-checking service"
      >
        <Input
          id="apiKey"
          type="password"
          value={localConfig.apiKey || ''}
          onChange={(e) => handleInputChange('apiKey', e.target.value)}
          placeholder="Enter your API key"
        />
      </FormField>
      
      <FormField 
        label="Confidence Threshold" 
        htmlFor="threshold"
        description="Minimum confidence score to accept facts (0-1)"
      >
        <div className="pt-2 pb-4">
          <Slider
            defaultValue={[localConfig.threshold || 0.7]}
            max={1}
            step={0.05}
            onValueChange={(value) => handleInputChange('threshold', value[0])}
          />
          <div className="text-xs text-right mt-1">
            {localConfig.threshold || 0.7}
          </div>
        </div>
      </FormField>
      
      <FormField 
        label="Trusted Sources" 
        htmlFor="sources"
        description="Sources to check facts against (comma-separated)"
      >
        <Textarea
          id="sources"
          value={Array.isArray(localConfig.sources) ? localConfig.sources.join(', ') : ''}
          onChange={(e) => handleInputChange('sources', e.target.value.split(',').map((s: string) => s.trim()))}
          placeholder="source1, source2, source3"
          className="min-h-[80px]"
        />
      </FormField>
      
      <div className="flex items-center space-x-2 mt-4">
        <Switch
          id="strictMode"
          checked={localConfig.strictMode || false}
          onCheckedChange={(checked) => handleInputChange('strictMode', checked)}
        />
        <Label htmlFor="strictMode">Strict Mode</Label>
        <span className="text-xs text-muted-foreground ml-auto">
          Requires multiple sources to confirm
        </span>
      </div>
    </>
  );
};

export default FactCheckAgentForm;
