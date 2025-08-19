'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';
import { cn } from '@/lib/utils';

type PfTextareaProps = {
  id: string;
  label: string;
  placeholder?: string;
  register?: UseFormRegister<FieldValues>;
  errors?: any;
  value?: string;
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
  register,
  errors,
  value,
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
        {...register(name)}
        required={required}
        disabled={disabled}
        className={textareaClassName}
        name={name}
        rows={rows}
      />
      {errors[name] && (
        <span className="text-red-500 text-[11px]">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
};

export default PfTextarea;