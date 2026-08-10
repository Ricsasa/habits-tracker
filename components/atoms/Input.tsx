'use client';

import { useEffect, useId, useRef } from 'react';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  error?: string;
  maxLength?: number;
  required?: boolean;
  autoFocus?: boolean;
}

const BASE =
  'w-full px-3 py-2.5 border bg-surface-primary text-content-primary rounded-none placeholder-content-tertiary dark:bg-surface-primary-dark dark:text-content-primary-dark dark:placeholder-content-tertiary-dark';

export default function Input({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  error,
  maxLength,
  required = false,
  autoFocus = false,
}: InputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus after mount rather than via the autoFocus attribute: the attribute
  // only applies on the initial page load, so it misses inputs that appear
  // later (a form opening in place).
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const border = error
    ? 'border-2 border-red-600 dark:border-red-500'
    : 'border-border-light focus:border-2 focus:border-category-study dark:border-border-light-dark dark:focus:border-category-study-dark';
  return (
    <div className="rounded-none">
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block form-label font-600 text-content-primary dark:text-content-primary-dark"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${BASE} ${border}`}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
