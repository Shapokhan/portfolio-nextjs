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

type PfTextareaProps<T extends FieldValues> = {
  label: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  value?: string;
  className?: string;
  textareaClassName?: string;
  required?: boolean;
  disabled?: boolean;
  name: Path<T>; // ensures name is one of your schema keys
  rows?: number;
};

const PfTextarea = <T extends FieldValues>({
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
  rows = 3,
}: PfTextareaProps<T>) => {
  return (
    <div className={cn('grid w-full gap-2', className)}>
      <div className="flex space-x-1">
        <Label htmlFor={name}>{label}</Label>
        {required && <span className="text-red-500">{'*'}</span>}
      </div>
      
      <Textarea
        id={name}
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