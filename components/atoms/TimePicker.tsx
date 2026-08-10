'use client';

import { useId } from 'react';

export interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const BASE =
  'w-full px-3 py-2.5 border border-border-light bg-surface-primary text-content-primary rounded-none focus:border-2 focus:border-category-study dark:bg-surface-primary-dark dark:border-border-light-dark dark:text-content-primary-dark dark:focus:border-category-study-dark';

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const id = useId();
  return (
    <div className="min-w-0 rounded-none">
      <label
        htmlFor={id}
        className="mb-1.5 block form-label font-600 text-content-primary dark:text-content-primary-dark"
      >
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={BASE}
      />
    </div>
  );
}
