'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type PfTextareaProps = {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  textareaClassName?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  rows?: number;
};

const PfTextarea: React.FC<PfTextareaProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
  textareaClassName,
  required = false,
  disabled = false,
  name,
  rows = 3
}) => {
  return (
    <div className={`grid w-full gap-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={textareaClassName}
        name={name}
        rows={rows}
      />
    </div>
  );
};

export default PfTextarea;