'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PfInputFieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  value,
  onChange,
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
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClassName}
      />
    </div>
  );
};

export default PfInputField;
