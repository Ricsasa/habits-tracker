'use client';

import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import CategoriesPanel from '@/components/organisms/CategoriesPanel';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useCategories, useTags } from '@/lib/db-queries';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { data: categories = [], isPending: categoriesPending } = useCategories();
  const { data: tags = [], isPending: tagsPending } = useTags();
  const isLoading = categoriesPending || tagsPending;

  return (
    <>
      <h1 className="band-rule mb-8 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('categoriesPage.title')}
      </h1>
      {isLoading ? (
        <div className="flex min-h-[360px] items-center justify-center border border-border-light bg-surface-secondary p-10 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark">
          <LoadingIndicator />
        </div>
      ) : (
        <CategoriesPanel categories={categories} tags={tags} />
      )}
    </>
  );
}
