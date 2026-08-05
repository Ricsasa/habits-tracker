'use client';

import { useState } from 'react';
import { Category, Tag } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/atoms/Button';
import EntityForm from '@/components/molecules/EntityForm';
import CategoryRow from './CategoryRow';

export interface CategoriesPanelProps {
  categories: Category[];
  tags: Tag[];
}

type Editor =
  | { kind: 'category'; category?: Category }
  | { kind: 'tag'; categoryId: string; tag?: Tag }
  | null;

const MAX_CATEGORIES = 7;

export default function CategoriesPanel({ categories, tags }: CategoriesPanelProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const store = useAppStore();
  const [editor, setEditor] = useState<Editor>(null);

  async function run(action: Promise<unknown>, messageKey: string) {
    try {
      await action;
      showToast(t(messageKey), 'success');
      setEditor(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('common.error'), 'error');
    }
  }

  async function saveCategory(name: string, color: string) {
    if (editor?.kind !== 'category') return;
    const existing = editor.category;
    if (existing) {
      await run(store.updateCategory(existing.id, { name, color }), 'messages.categoryUpdated');
      return;
    }
    await run(store.createCategory({ name, color }), 'messages.categoryCreated');
  }

  async function saveTag(name: string, color: string) {
    if (editor?.kind !== 'tag') return;
    const existing = editor.tag;
    if (existing) {
      await run(store.updateTag(existing.id, { name, color }), 'messages.tagUpdated');
      return;
    }
    await run(store.createTag({ category_id: editor.categoryId, name, color }), 'messages.tagCreated');
  }

  function removeCategory(category: Category) {
    if (!window.confirm(t('messages.confirmDeleteCategory'))) return;
    void run(store.deleteCategory(category.id), 'messages.categoryDeleted');
  }

  function removeTag(tag: Tag) {
    if (!window.confirm(t('messages.confirmDeleteTag'))) return;
    void run(store.deleteTag(tag.id), 'messages.tagDeleted');
  }

  const atLimit = categories.length >= MAX_CATEGORIES;

  return (
    <section className="flex flex-col gap-4 rounded-none">
      <div className="flex items-center justify-between gap-3 rounded-none">
        <p className="text-xs font-600 uppercase text-content-tertiary dark:text-content-tertiary-dark">
          {t('categoriesPage.categoryCount', { count: categories.length })}
        </p>
        <Button
          variant="secondary"
          disabled={atLimit}
          onClick={() => setEditor({ kind: 'category' })}
        >
          {t('buttons.addCategory')}
        </Button>
      </div>

      {atLimit ? (
        <p className="border border-border-light bg-surface-secondary p-3 text-xs text-content-tertiary rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark dark:text-content-tertiary-dark">
          {t('messages.categoryLimitReached')}
        </p>
      ) : null}

      {editor?.kind === 'category' ? (
        <EntityForm
          title={editor.category ? t('categoriesPage.editCategory') : t('categoriesPage.newCategory')}
          nameLabel={t('forms.categoryName')}
          namePlaceholder={t('forms.categoryNamePlaceholder')}
          initialName={editor.category?.name}
          initialColor={editor.category?.color}
          onSubmit={saveCategory}
          onCancel={() => setEditor(null)}
        />
      ) : null}

      {editor?.kind === 'tag' ? (
        <EntityForm
          title={editor.tag ? t('categoriesPage.editTag') : t('categoriesPage.newTag')}
          nameLabel={t('forms.tagName')}
          namePlaceholder={t('forms.tagNamePlaceholder')}
          initialName={editor.tag?.name}
          initialColor={editor.tag?.color}
          onSubmit={saveTag}
          onCancel={() => setEditor(null)}
        />
      ) : null}

      <div className="flex flex-col gap-3 rounded-none">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            tags={tags.filter((tag) => tag.category_id === category.id)}
            onEdit={(target) => setEditor({ kind: 'category', category: target })}
            onDelete={removeCategory}
            onAddTag={(target) => setEditor({ kind: 'tag', categoryId: target.id })}
            onEditTag={(tag) => setEditor({ kind: 'tag', categoryId: tag.category_id, tag })}
            onDeleteTag={removeTag}
          />
        ))}
      </div>
    </section>
  );
}
