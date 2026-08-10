'use client';

import { useParams, useRouter } from 'next/navigation';
import ActivityForm from '@/components/molecules/ActivityForm';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useActivity, useCategories, useTags, useUpdateActivity } from '@/lib/db-queries';
import { ActivityInput } from '@/lib/types';

export default function EditActivityPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { data: categories = [], isPending: categoriesPending } = useCategories();
  const { data: tags = [], isPending: tagsPending } = useTags();
  const { data: activity } = useActivity(params.id);
  const isLoading = !activity || categoriesPending || tagsPending;
  const { mutateAsync: updateActivity } = useUpdateActivity();

  async function handleSubmit(input: ActivityInput) {
    try {
      await updateActivity({ id: params.id, input });
      showToast(t('messages.activityUpdated'), 'success');
      router.push('/dashboard');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('common.error'), 'error');
    }
  }

  return (
    <>
      <h1 className="band-rule mb-8 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('buttons.edit')}
      </h1>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ActivityForm
          activity={activity}
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard')}
        />
      )}
    </>
  );
}
