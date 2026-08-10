'use client';

import { useState } from 'react';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ActivityForm from '@/components/molecules/ActivityForm';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useCategories, useCreateActivity, useTags } from '@/lib/db-queries';
import { ActivityInput } from '@/lib/types';

export default function AddActivityPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { data: categories = [], isPending: categoriesPending } = useCategories();
  const { data: tags = [], isPending: tagsPending } = useTags();
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
      {/* The selectors render empty until both lists land, so hold the form
          behind the loading mark instead of showing a category-less form. */}
      {categoriesPending || tagsPending ? (
        <div className="flex min-h-[40dvh] items-center justify-center">
          <LoadingIndicator />
        </div>
      ) : (
        <ActivityForm
          key={formKey}
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={() => setFormKey((key) => key + 1)}
          cancelLabel={t('buttons.clear')}
        />
      )}
    </>
  );
}
