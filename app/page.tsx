'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import ActivityForm from '@/components/molecules/ActivityForm';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import { ActivityInput } from '@/lib/types';

export default function AddActivityPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const categories = useAppStore((state) => state.categories);
  const tags = useAppStore((state) => state.tags);
  const loadCategories = useAppStore((state) => state.loadCategories);
  const loadTags = useAppStore((state) => state.loadTags);
  const createActivity = useAppStore((state) => state.createActivity);
  // Remounting the form is how it resets: useActivityForm holds no reset handle.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    void loadCategories();
    void loadTags();
  }, [loadCategories, loadTags]);

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
    <AppShell>
      <h1 className="mb-6 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
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
    </AppShell>
  );
}
