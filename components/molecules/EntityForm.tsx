'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export interface EntityFormProps {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  initialName?: string;
  initialColor?: string;
  onSubmit: (name: string, color: string) => Promise<void>;
  onCancel: () => void;
}

export default function EntityForm({
  title,
  nameLabel,
  namePlaceholder,
  initialName = '',
  initialColor = '#2563eb',
  onSubmit,
  onCancel,
}: EntityFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length === 0) return;
    setIsSaving(true);
    try {
      await onSubmit(name.trim(), color);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border border-border-light bg-surface-secondary p-4 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark"
    >
      <p className="text-base font-600 text-content-primary dark:text-content-primary-dark">
        {title}
      </p>
      <Input value={name} onChange={setName} label={nameLabel} placeholder={namePlaceholder} />
      <div className="rounded-none">
        <label
          htmlFor="entity-color"
          className="mb-1.5 block text-base font-600 text-content-primary dark:text-content-primary-dark"
        >
          {t('forms.color')}
        </label>
        <input
          id="entity-color"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-10 w-20 border border-border-light bg-surface-primary rounded-none dark:border-border-light-dark dark:bg-surface-primary-dark"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-none">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          {t('buttons.cancel')}
        </Button>
        <Button variant="primary" type="submit" disabled={isSaving} fullWidth>
          {isSaving ? t('common.loading') : t('buttons.save')}
        </Button>
      </div>
    </form>
  );
}
