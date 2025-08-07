// components/pf/pf-checkbox.tsx

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

type PfCheckboxProps = {
  id: string;
  name?: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const PfCheckbox: React.FC<PfCheckboxProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <Label
      htmlFor={id}
      className={`flex items-center gap-2 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-primary"
      />
      <span>{label}</span>
    </Label>
  );
};

export default PfCheckbox;
