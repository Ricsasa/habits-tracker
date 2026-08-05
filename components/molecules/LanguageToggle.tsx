'use client';

import { Language } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';

const BASE = 'flex-1 px-4 py-2 text-sm font-600 rounded-none';
const SELECTED = 'bg-category-study text-white dark:bg-category-study-dark';
const UNSELECTED =
  'bg-surface-primary text-content-primary dark:bg-surface-secondary-dark dark:text-content-primary-dark';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const options: Array<{ value: Language; label: string }> = [
    { value: 'en', label: t('settings.english') },
    { value: 'es', label: t('settings.spanish') },
  ];

  return (
    <div
      role="group"
      aria-label={t('settings.language')}
      className="flex w-full border border-border-light rounded-none dark:border-border-light-dark lg:w-fit"
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={language === option.value}
          onClick={() => setLanguage(option.value)}
          className={`${BASE} ${language === option.value ? SELECTED : UNSELECTED} ${
            index === 0 ? 'border-r border-border-light dark:border-border-light-dark' : ''
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
