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

type PfInputFieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  register?: UseFormRegister<FieldValues>;
  errors?: any;
  value?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  name:string;
};

const PfInputField: React.FC<PfInputFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  errors,
  value,
  className,
  inputClassName,
  required = false,
  disabled = false,
  name
}) => {
  return (
    <div className={`grid w-full max-w-sm items-center gap-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        disabled={disabled}
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
