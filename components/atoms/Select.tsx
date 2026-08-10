'use client';

import { useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const BASE =
  'w-full appearance-none px-3 py-2.5 border rounded-none border-border-light focus:border-2 focus:border-category-study dark:border-border-light-dark dark:focus:border-category-study-dark';

export default function Select({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
}: SelectProps) {
  const id = useId();
  const tone = disabled
    ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed dark:bg-surface-tertiary-dark dark:text-content-tertiary-dark'
    : 'bg-surface-primary text-content-primary dark:bg-surface-primary-dark dark:text-content-primary-dark';
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
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${BASE} ${tone}`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
