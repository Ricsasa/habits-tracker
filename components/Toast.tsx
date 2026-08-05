'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';

export type ToastVariant = 'success' | 'error';

export interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const CONTAINER: Record<ToastVariant, string> = {
  success: 'border-category-exercise dark:border-category-exercise-dark',
  error: 'border-red-600 dark:border-red-500',
};

const TEXT: Record<ToastVariant, string> = {
  success: 'text-category-exercise dark:text-category-exercise-dark',
  error: 'text-red-600 dark:text-red-500',
};

export default function Toast({ message, variant, onDismiss }: ToastProps) {
  const { t } = useLanguage();
  return (
    <div
      role={variant === 'success' ? 'status' : 'alert'}
      className={`flex items-center justify-between gap-3 border p-3 rounded-none bg-surface-primary dark:bg-surface-secondary-dark ${CONTAINER[variant]}`}
    >
      <span className={`text-xs font-600 ${TEXT[variant]}`}>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('common.dismiss')}
        className="border-0 bg-transparent px-1 text-base text-content-tertiary dark:text-content-tertiary-dark rounded-none"
      >
        ✕
      </button>
    </div>
  );
}
