'use client';

import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export interface ButtonProps {
  variant: ButtonVariant;
  disabled?: boolean;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const BASE = 'px-4 py-2.5 font-600 text-base rounded-none border';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-category-study text-white hover:bg-blue-700 dark:bg-category-study-dark dark:hover:bg-blue-500',
  secondary:
    'border-border-light bg-surface-primary text-content-primary hover:bg-surface-tertiary hover:border-border-medium dark:bg-surface-secondary-dark dark:border-border-light-dark dark:text-content-primary-dark dark:hover:bg-surface-tertiary-dark dark:hover:border-border-medium-dark',
  ghost:
    'border-transparent bg-transparent text-category-study hover:bg-blue-50 hover:text-blue-700 dark:text-category-study-dark dark:hover:bg-blue-900/20',
  destructive:
    'border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
};

const DISABLED = 'border-transparent bg-gray-400 text-white cursor-not-allowed';

export default function Button({
  variant,
  disabled = false,
  type = 'button',
  fullWidth = false,
  onClick,
  children,
}: ButtonProps) {
  const state = disabled ? DISABLED : VARIANTS[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${BASE} ${state} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}
