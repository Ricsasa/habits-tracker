'use client';

import { Tag } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { translateTagName } from '@/lib/translations/categoryNames';

export interface TagSelectorProps {
  tags: Tag[];
  categoryId: string | null;
  selectedId: string | null;
  onSelect: (tagId: string | null) => void;
}

const BASE = 'px-2.5 py-1.5 text-xs rounded-none';

export default function TagSelector({
  tags,
  categoryId,
  selectedId,
  onSelect,
}: TagSelectorProps) {
  const { t } = useLanguage();

  if (!categoryId) {
    return (
      <p className="border border-border-light bg-surface-secondary p-3 text-xs text-content-tertiary rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark dark:text-content-tertiary-dark">
        {t('empty.selectCategoryFirst')}
      </p>
    );
  }

  const scoped = tags.filter((tag) => tag.category_id === categoryId);
  if (scoped.length === 0) {
    return (
      <p className="border border-border-light bg-surface-secondary p-3 text-xs text-content-tertiary rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark dark:text-content-tertiary-dark">
        {t('empty.noTagsInCategory')}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-none">
      {scoped.map((tag) => {
        const selected = tag.id === selectedId;
        return (
          <button
            key={tag.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected ? null : tag.id)}
            className={`${BASE} ${
              selected
                ? 'border-2 border-category-study bg-category-study font-600 text-white dark:border-category-study-dark dark:bg-category-study-dark'
                : 'border border-border-light bg-surface-primary text-content-primary dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark'
            }`}
          >
            {translateTagName(tag.name, t)}
          </button>
        );
      })}
    </div>
  );
}
