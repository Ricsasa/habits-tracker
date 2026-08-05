'use client';

import { useEffect } from 'react';
import AppShell from '@/components/AppShell';
import CategoriesPanel from '@/components/organisms/CategoriesPanel';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const categories = useAppStore((state) => state.categories);
  const tags = useAppStore((state) => state.tags);
  const loadCategories = useAppStore((state) => state.loadCategories);
  const loadTags = useAppStore((state) => state.loadTags);

  useEffect(() => {
    void loadCategories();
    void loadTags();
  }, [loadCategories, loadTags]);

  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('categoriesPage.title')}
      </h1>
      <CategoriesPanel categories={categories} tags={tags} />
    </AppShell>
  );
}
