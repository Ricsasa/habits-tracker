'use client';

import { Category } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { translateCategoryName } from '@/lib/translations/categoryNames';

export interface CategorySelectorProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

const BASE = 'px-3.5 py-2.5 text-sm font-600 text-center rounded-none';

export default function CategorySelector({
  categories,
  selectedId,
  onSelect,
}: CategorySelectorProps) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-2 rounded-none lg:grid-cols-4">
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(category.id)}
            style={
              selected
                ? { backgroundColor: category.color, borderColor: category.color }
                : undefined
            }
            className={`${BASE} ${
              selected
                ? 'border-2 text-white'
                : 'border border-border-light bg-surface-primary text-content-primary dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark'
            }`}
          >
            {translateCategoryName(category.name, t)}
          </button>
        );
      })}
    </div>
  );
}
