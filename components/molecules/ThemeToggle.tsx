'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Theme } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';

const BASE = 'flex-1 px-4 py-2 text-sm font-600 rounded-none';
const SELECTED = 'bg-category-study text-white dark:bg-category-study-dark';
const UNSELECTED =
  'bg-surface-primary text-content-primary dark:bg-surface-secondary-dark dark:text-content-primary-dark';

export default function ThemeToggle() {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const options: Array<{ value: Theme; label: string }> = [
    { value: 'light', label: t('settings.lightMode') },
    { value: 'dark', label: t('settings.darkMode') },
    { value: 'system', label: t('settings.systemMode') },
  ];

  return (
    <div
      role="group"
      aria-label={t('settings.theme')}
      className="flex w-full border border-border-light rounded-none dark:border-border-light-dark lg:w-fit"
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={mounted && theme === option.value}
          onClick={() => setTheme(option.value)}
          className={`${BASE} ${
            mounted && theme === option.value ? SELECTED : UNSELECTED
          } ${index < 2 ? 'border-r border-border-light dark:border-border-light-dark' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
