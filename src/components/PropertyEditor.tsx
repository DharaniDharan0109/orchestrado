
import React, { useState, useEffect, Fragment } from 'react';
import useFlowStore, { AgentType } from '@/store/flowStore';
import { X, Play, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";

// Form field component
interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  description?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children, description }) => (
  <div className="mb-4">
    <Label htmlFor={htmlFor} className="mb-1 block">
      {label}
    </Label>
    {children}
    {description && (
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    )}
  </div>
);

interface PropertyEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ isOpen, onClose }) => {
  const { selectedNode, updateNodeConfig, updateNodeStatus } = useFlowStore();
  const [localConfig, setLocalConfig] = useState<any>({});
  const { toast } = useToast();

  // Update local config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setLocalConfig(selectedNode.data.config);
    }
  }, [selectedNode]);

  // Handle save config
  const handleSaveConfig = () => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, localConfig);
      toast({
        title: "Configuration Saved",
        description: `Updated settings for ${selectedNode.data.label}.`,
        duration: 3000,
      });
    }
  };

  // Handle execute agent
  const handleExecute = () => {
    if (selectedNode) {
      updateNodeStatus(selectedNode.id, 'running');
      
      // Simulate agent execution
      setTimeout(() => {
        // 80% chance of success
        const success = Math.random() > 0.2;
        updateNodeStatus(selectedNode.id, success ? 'success' : 'error');
        
        toast({
          title: success ? "Agent Executed Successfully" : "Agent Execution Failed",
          description: success 
            ? `${selectedNode.data.label} completed its task.` 
            : `${selectedNode.data.label} encountered an error.`,
          variant: success ? "default" : "destructive",
          duration: 3000,
        });
      }, 2000);
    }
  };

  // Input change handler
  const handleInputChange = (key: string, value: any) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // Render different config forms based on agent type
  const renderConfigForm = () => {
    if (!selectedNode) return null;

    switch (selectedNode.data.type as AgentType) {
      case 'scraperAgent':
        return (
          <Fragment>
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
          </Fragment>
        );
      
      case 'nlpAgent':
        return (
          <Fragment>
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
          </Fragment>
        );
      
      case 'factCheckAgent':
        return (
          <Fragment>
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
          </Fragment>
        );
      
      case 'blockchainAgent':
        return (
          <Fragment>
            <FormField label="Blockchain Network" htmlFor="network">
              <select
                id="network"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={localConfig.network || 'ethereum'}
                onChange={(e) => handleInputChange('network', e.target.value)}
              >
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="solana">Solana</option>
                <option value="hyperledger">Hyperledger</option>
              </select>
            </FormField>
            
            <FormField 
              label="Smart Contract Address" 
              htmlFor="contract"
              description="Address of deployed contract (if applicable)"
            >
              <Input
                id="contract"
                value={localConfig.contract || ''}
                onChange={(e) => handleInputChange('contract', e.target.value)}
                placeholder="0x..."
              />
            </FormField>
            
            <FormField 
              label="Wallet Address / Private Key" 
              htmlFor="wallet"
              description="Credentials for blockchain operations"
            >
              <Input
                id="wallet"
                type="password"
                value={localConfig.wallet || ''}
                onChange={(e) => handleInputChange('wallet', e.target.value)}
                placeholder="Enter wallet address or private key"
              />
            </FormField>
            
            <FormField 
              label="Gas Limit" 
              htmlFor="gasLimit"
              description="Maximum gas for transactions (Ethereum-based chains)"
            >
              <Input
                id="gasLimit"
                type="number"
                min="21000"
                value={localConfig.gasLimit || 100000}
                onChange={(e) => handleInputChange('gasLimit', parseInt(e.target.value))}
              />
            </FormField>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="testnet"
                checked={localConfig.testnet || false}
                onCheckedChange={(checked) => handleInputChange('testnet', checked)}
              />
              <Label htmlFor="testnet">Use Testnet</Label>
            </div>
          </Fragment>
        );
      
      case 'customAgent':
        return (
          <Fragment>
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
          </Fragment>
        );
      
      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            No configuration options available for this agent.
          </div>
        );
    }
  };

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
          renderConfigForm()
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
