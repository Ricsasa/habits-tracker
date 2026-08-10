'use client';

import { useState } from 'react';
import ActivityForm from '@/components/molecules/ActivityForm';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useCategories, useCreateActivity, useTags } from '@/lib/db-queries';
import { ActivityInput } from '@/lib/types';

export default function AddActivityPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const { mutateAsync: createActivity } = useCreateActivity();
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(input: ActivityInput) {
    try {
      await createActivity(input);
      showToast(t('messages.activitySaved'), 'success');
      setFormKey((key) => key + 1);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('common.error'), 'error');
    }
  }

  return (
    <>
      <h1 className="band-rule mb-8 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('buttons.addActivity')}
      </h1>
      <ActivityForm
        key={formKey}
        categories={categories}
        tags={tags}
        onSubmit={handleSubmit}
        onCancel={() => setFormKey((key) => key + 1)}
        cancelLabel={t('buttons.clear')}
      />
    </>
  );
}
