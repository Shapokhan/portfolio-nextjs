'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';
import { cn } from '@/lib/utils';

const PfInputField = <T extends FieldValues>({
  name,
  placeholder,
  register,
  errors,
  label,
  labelClasses,
  required,
  type = 'text',
  className,
  inputClassName,
}: {
  name: Path<T>; // Use Path<T> to ensure valid form field paths
  placeholder: string; // Placeholder text for the input
  register: UseFormRegister<T>; // Register function for the form
  errors: FieldErrors<T>; // Validation errors
  label?: string;
  labelClasses?: string;
  required?: boolean;
  type?: string;
  className?: string;
  inputClassName?: string;
}) => {
  return (
    <div className={`grid w-full items-center gap-2 ${className}`}>
      <div className="flex space-x-1">
        <Label htmlFor={name} className={cn('flex gap-1', labelClasses)}>
          {label}
        </Label>
        {required && <span className="text-red-500">{'*'}</span>}
      </div>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={inputClassName}
        {...register(name)}
      />
      {errors[name] && (
        <span className="text-red-500 text-[11px]">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
};

export default PfInputField;
