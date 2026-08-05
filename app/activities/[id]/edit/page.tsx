'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import ActivityForm from '@/components/molecules/ActivityForm';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { fetchActivity, useAppStore } from '@/lib/store';
import { Activity, ActivityInput } from '@/lib/types';

export default function EditActivityPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const categories = useAppStore((state) => state.categories);
  const tags = useAppStore((state) => state.tags);
  const loadCategories = useAppStore((state) => state.loadCategories);
  const loadTags = useAppStore((state) => state.loadTags);
  const updateActivity = useAppStore((state) => state.updateActivity);
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    void loadCategories();
    void loadTags();
    void fetchActivity(params.id).then(setActivity);
  }, [loadCategories, loadTags, params.id]);

  async function handleSubmit(input: ActivityInput) {
    try {
      await updateActivity(params.id, input);
      showToast(t('messages.activityUpdated'), 'success');
      router.push('/dashboard');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('common.error'), 'error');
    }
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('buttons.edit')}
      </h1>
      {activity ? (
        <ActivityForm
          activity={activity}
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard')}
        />
      ) : (
        <p className="text-base text-content-tertiary dark:text-content-tertiary-dark">
          {t('common.loading')}
        </p>
      )}
    </AppShell>
  );
}
