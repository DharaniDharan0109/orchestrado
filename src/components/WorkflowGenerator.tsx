
import React, { useState } from 'react';
import { Wand, BookOpen, X } from 'lucide-react';
import useFlowStore from '@/store/flowStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export const WorkflowGenerator = () => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const { autoGenerateWorkflow } = useFlowStore();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description of the workflow you want to generate.",
        variant: "destructive"
      });
      return;
    }

    autoGenerateWorkflow(description);
    setOpen(false);
    
    toast({
      title: "Workflow Generated",
      description: `'${workflowName || 'New workflow'}' has been generated based on your description.`,
    });
  };

  const examples = [
    "Scrape news articles, analyze text with NLP, and fact-check the information",
    "Extract data from websites and store verified information on blockchain",
    "Process text content using NLP and record the results",
    "Crawl multiple sites, analyze sentiment, verify facts, and log results",
    "Extract content from PDFs, process with AI, and summarize key findings"
  ];

  const loadExample = (example: string) => {
    setDescription(example);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="gap-1" 
        onClick={() => setOpen(true)}
      >
        <Wand size={14} /> Auto-Generate
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Auto-Generate Workflow</DialogTitle>
            <DialogDescription>
              Enter a description of what you want your workflow to do, and we'll generate it for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="workflow-name" className="text-sm font-medium">Workflow Name</label>
              <Input
                id="workflow-name"
                placeholder="My Workflow"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="workflow-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="workflow-description"
                placeholder="e.g., 'Extract news from websites, process with NLP, verify facts'"
                className="w-full h-32 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                <BookOpen size={14} /> Examples:
              </div>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <div 
                    key={index}
                    className="text-xs p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => loadExample(example)}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <X size={14} className="mr-1" /> Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleGenerate}>
              <Wand size={14} className="mr-1" /> Generate Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkflowGenerator;
