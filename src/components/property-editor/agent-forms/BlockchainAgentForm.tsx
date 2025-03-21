
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FormField from '../FormField';

interface BlockchainAgentFormProps {
  localConfig: any;
  handleInputChange: (key: string, value: any) => void;
}

const BlockchainAgentForm: React.FC<BlockchainAgentFormProps> = ({ localConfig, handleInputChange }) => {
  return (
    <>
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
    </>
  );
};

export default BlockchainAgentForm;
