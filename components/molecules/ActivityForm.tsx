'use client';

import { useState } from 'react';
import { Activity, ActivityInput, Category, Tag } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { formatDuration, todayIso } from '@/lib/locale-utils';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import DatePicker from '@/components/atoms/DatePicker';
import TimePicker from '@/components/atoms/TimePicker';
import RatingStars from '@/components/atoms/RatingStars';
import CategorySelector from './CategorySelector';
import TagSelector from './TagSelector';
import { toActivityInput, useActivityForm, validateValues } from './useActivityForm';

export interface ActivityFormProps {
  activity?: Activity;
  categories: Category[];
  tags: Tag[];
  onSubmit: (input: ActivityInput) => Promise<void>;
  onCancel: () => void;
  cancelLabel?: string;
}

const LABEL = 'mb-2 block text-base font-600 text-content-primary dark:text-content-primary-dark';

export default function ActivityForm({
  activity,
  categories,
  tags,
  onSubmit,
  onCancel,
  cancelLabel,
}: ActivityFormProps) {
  const { t } = useLanguage();
  const { values, errors, setErrors, update, durationMinutes } = useActivityForm(activity);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateValues(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setIsSaving(true);
    try {
      await onSubmit(toActivityInput(values));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-none">
      <Input
        value={values.title}
        onChange={(value) => update('title', value)}
        label={t('forms.activityTitle')}
        placeholder={t('forms.activityTitlePlaceholder')}
        maxLength={255}
        error={errors.title ? t(errors.title) : undefined}
      />

      <div className="rounded-none">
        <span className={LABEL}>{t('forms.category')}</span>
        <CategorySelector
          categories={categories}
          selectedId={values.categoryId}
          onSelect={(id) => {
            update('categoryId', id);
            update('tagId', null);
          }}
        />
        {errors.category ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-500">{t(errors.category)}</p>
        ) : null}
      </div>

      <div className="rounded-none">
        <span className={LABEL}>{t('forms.tag')}</span>
        <TagSelector
          tags={tags}
          categoryId={values.categoryId}
          selectedId={values.tagId}
          onSelect={(id) => update('tagId', id)}
        />
      </div>

      <DatePicker
        value={values.date}
        onChange={(value) => update('date', value)}
        label={t('forms.date')}
        max={todayIso()}
      />

      <div className="grid grid-cols-2 gap-3 rounded-none">
        <TimePicker
          value={values.startTime}
          onChange={(value) => update('startTime', value)}
          label={t('forms.startTime')}
        />
        <TimePicker
          value={values.endTime}
          onChange={(value) => update('endTime', value)}
          label={t('forms.endTime')}
        />
      </div>

      <div className="border border-border-light bg-surface-secondary p-2.5 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark">
        <p className="text-sm text-content-secondary dark:text-content-secondary-dark">
          {t('forms.duration')}
          {t('common.colon')}
          <strong className="text-content-primary dark:text-content-primary-dark">
            {formatDuration(durationMinutes)}
          </strong>
        </p>
        {errors.time ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-500">{t(errors.time)}</p>
        ) : null}
      </div>

      <div className="rounded-none">
        <span className={LABEL}>{t('forms.rating')}</span>
        <RatingStars rating={values.rating} onChange={(value) => update('rating', value)} />
      </div>

      <div className="rounded-none">
        <label className={LABEL} htmlFor="activity-notes">
          {t('forms.notes')}
        </label>
        <textarea
          id="activity-notes"
          value={values.notes}
          placeholder={t('forms.addNotes')}
          onChange={(event) => update('notes', event.target.value)}
          className="min-h-20 w-full resize-y border border-border-light bg-surface-primary px-3 py-2.5 text-base text-content-primary placeholder-content-tertiary rounded-none focus:border-2 focus:border-category-study dark:border-border-light-dark dark:bg-surface-primary-dark dark:text-content-primary-dark dark:placeholder-content-tertiary-dark dark:focus:border-category-study-dark"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-none">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          {cancelLabel ?? t('buttons.cancel')}
        </Button>
        <Button variant="primary" type="submit" disabled={isSaving} fullWidth>
          {isSaving ? t('common.loading') : t('buttons.save')}
        </Button>
      </div>
    </form>
  );
}
