'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/atoms/Button';
import { useLanguage } from '@/lib/i18n/useLanguage';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    confirmRef.current?.querySelector('button')?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        ref={confirmRef}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm border border-border-light bg-surface-primary p-5 rounded-none dark:border-border-light-dark dark:bg-surface-secondary-dark"
      >
        <p className="text-base font-600 text-content-primary dark:text-content-primary-dark">
          {title}
        </p>
        <p className="mt-2 text-sm text-content-secondary dark:text-content-secondary-dark">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2 rounded-none">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel ?? t('buttons.cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel ?? t('buttons.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
