
import React from 'react';
import { Input } from '@/components/ui/input';
import FormField from '../FormField';

interface ScraperAgentFormProps {
  localConfig: any;
  handleInputChange: (key: string, value: any) => void;
}

const ScraperAgentForm: React.FC<ScraperAgentFormProps> = ({ localConfig, handleInputChange }) => {
  return (
    <>
      <FormField label="URL to Scrape" htmlFor="url">
        <Input
          id="url"
          type="url"
          value={localConfig.url || ''}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="https://example.com"
        />
      </FormField>
      
      <FormField 
        label="CSS Selectors" 
        htmlFor="selectors"
        description="Define CSS selectors for content extraction"
      >
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Title selector"
              value={localConfig.selectors?.title || ''}
              onChange={(e) => handleInputChange('selectors', {
                ...localConfig.selectors,
                title: e.target.value
              })}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Content selector"
              value={localConfig.selectors?.content || ''}
              onChange={(e) => handleInputChange('selectors', {
                ...localConfig.selectors,
                content: e.target.value
              })}
            />
          </div>
        </div>
      </FormField>
      
      <FormField 
        label="Update Interval (seconds)" 
        htmlFor="interval"
        description="Time between data fetches"
      >
        <Input
          id="interval"
          type="number"
          min="1"
          value={localConfig.interval || 60}
          onChange={(e) => handleInputChange('interval', parseInt(e.target.value))}
        />
      </FormField>
    </>
  );
};

export default ScraperAgentForm;
