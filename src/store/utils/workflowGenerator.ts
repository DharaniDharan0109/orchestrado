
import { AgentNode, AgentType } from '../types/agentTypes';
import { Edge } from '@xyflow/react';
import { createAgentNode } from './flowUtils';
import { nanoid } from 'nanoid';

export const generateWorkflow = (description: string): { nodes: AgentNode[], edges: Edge[] } => {
  // Simple NLP-based workflow generation logic
  const scrape = /scrape|extract|get data|collect|crawl|fetch/i;
  const nlp = /nlp|process|analyze|understand|language|text/i;
  const factCheck = /fact|check|verify|validate|confirm/i;
  const blockchain = /blockchain|log|record|store|save|ledger/i;
  
  const nodes: AgentNode[] = [];
  const edges: Edge[] = [];
  
  let xPosition = 100;
  const yPosition = 100;
  let lastNodeId = '';
  
  // Add scraper if needed
  if (scrape.test(description)) {
    const node = createAgentNode('scraperAgent', { x: xPosition, y: yPosition });
    nodes.push(node);
    lastNodeId = node.id;
    xPosition += 200;
  }
  
  // Add NLP if needed
  if (nlp.test(description)) {
    const node = createAgentNode('nlpAgent', { x: xPosition, y: yPosition });
    nodes.push(node);
    
    // Connect to previous node if exists
    if (lastNodeId) {
      edges.push({
        id: `e-${nanoid()}`,
        source: lastNodeId,
        target: node.id,
        animated: true,
        style: { stroke: '#929292' }
      });
    }
    
    lastNodeId = node.id;
    xPosition += 200;
  }
  
  // Add fact checker if needed
  if (factCheck.test(description)) {
    const node = createAgentNode('factCheckAgent', { x: xPosition, y: yPosition });
    nodes.push(node);
    
    // Connect to previous node if exists
    if (lastNodeId) {
      edges.push({
        id: `e-${nanoid()}`,
        source: lastNodeId,
        target: node.id,
        animated: true,
        style: { stroke: '#929292' }
      });
    }
    
    lastNodeId = node.id;
    xPosition += 200;
  }
  
  // Add blockchain if needed
  if (blockchain.test(description)) {
    const node = createAgentNode('blockchainAgent', { x: xPosition, y: yPosition });
    nodes.push(node);
    
    // Connect to previous node if exists
    if (lastNodeId) {
      edges.push({
        id: `e-${nanoid()}`,
        source: lastNodeId,
        target: node.id,
        animated: true,
        style: { stroke: '#929292' }
      });
    }
  }
  
  return { nodes, edges };
};
