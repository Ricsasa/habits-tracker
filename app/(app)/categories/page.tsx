'use client';

import CategoriesPanel from '@/components/organisms/CategoriesPanel';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useCategories, useTags } from '@/lib/db-queries';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  return (
    <>
      <h1 className="band-rule mb-8 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('categoriesPage.title')}
      </h1>
      <CategoriesPanel categories={categories} tags={tags} />
    </>
  );
}
