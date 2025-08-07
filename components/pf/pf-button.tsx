'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

type PfButtonProps = {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const PfButton: React.FC<PfButtonProps> = ({
  variant = 'default',
  className,
  onClick = () => {},
  children,
  isLoading,
  type = 'button',
  disabled = false,
}) => {
  return (
    <Button
      disabled={isLoading || disabled}
      variant={variant}
      className={className}
      onClick={onClick}
      type={type}
    >
      {isLoading ? 'Loading...' : children}
    </Button>
  );
};

export default PfButton;
