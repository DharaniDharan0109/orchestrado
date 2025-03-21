
import React from 'react';
import { Label } from '@/components/ui/label';

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

export default FormField;
