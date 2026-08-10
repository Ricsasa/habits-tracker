'use client';

import { Category, ReportFilters as ReportFiltersValue, Tag } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { translateCategoryName, translateTagName } from '@/lib/translations/categoryNames';
import DatePicker from '@/components/atoms/DatePicker';
import Select from '@/components/atoms/Select';

export interface ReportFiltersProps {
  categories: Category[];
  tags: Tag[];
  value: ReportFiltersValue;
  onChange: (filters: ReportFiltersValue) => void;
}

const CHIP = 'px-2.5 py-1.5 text-xs rounded-none';
const SELECTED =
  'border-2 border-category-study bg-category-study font-600 text-white dark:border-category-study-dark dark:bg-category-study-dark';
const UNSELECTED =
  'border border-border-light bg-surface-primary text-content-primary dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark';
const LABEL = 'mb-1.5 block text-sm font-600 text-content-primary dark:text-content-primary-dark';

function toggle(list: string[] | undefined, id: string): string[] {
  const current = list ?? [];
  return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
}

export default function ReportFilters({
  categories,
  tags,
  value,
  onChange,
}: ReportFiltersProps) {
  const { t } = useLanguage();
  const categoryIds = value.categoryIds ?? [];
  const scopedTags = tags.filter((tag) => categoryIds.includes(tag.category_id));

  const ratingOptions = [1, 2, 3, 4, 5].map((rating) => ({
    value: String(rating),
    label: `${rating}+`,
  }));

  return (
    <div className="flex flex-col gap-3 border border-border-light bg-surface-secondary p-4 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark">
      <p className="text-xs font-600 uppercase text-content-tertiary dark:text-content-tertiary-dark">
        {t('reports.filters')}
      </p>

      <div className="rounded-none">
        <span className={LABEL}>{t('reports.filterByCategory')}</span>
        <div className="flex flex-wrap gap-1.5 rounded-none">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={categoryIds.includes(category.id)}
              onClick={() =>
                onChange({ ...value, categoryIds: toggle(categoryIds, category.id), tagIds: [] })
              }
              className={`${CHIP} ${categoryIds.includes(category.id) ? SELECTED : UNSELECTED}`}
            >
              {translateCategoryName(category.name, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-none">
        <span className={LABEL}>{t('reports.filterByTag')}</span>
        {categoryIds.length === 0 ? (
          <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark">
            {t('reports.selectCategoryForTags')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 rounded-none">
            {scopedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                aria-pressed={(value.tagIds ?? []).includes(tag.id)}
                onClick={() => onChange({ ...value, tagIds: toggle(value.tagIds, tag.id) })}
                className={`${CHIP} ${(value.tagIds ?? []).includes(tag.id) ? SELECTED : UNSELECTED}`}
              >
                {translateTagName(tag.name, t)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-none">
        <DatePicker
          value={value.startDate ?? ''}
          onChange={(date) => onChange({ ...value, startDate: date || undefined })}
          label={t('reports.from')}
        />
        <DatePicker
          value={value.endDate ?? ''}
          onChange={(date) => onChange({ ...value, endDate: date || undefined })}
          label={t('reports.to')}
        />
      </div>

      <Select
        value={value.minRating === undefined ? '' : String(value.minRating)}
        onChange={(rating) =>
          onChange({ ...value, minRating: rating === '' ? undefined : Number(rating) })
        }
        options={ratingOptions}
        label={t('reports.filterByRating')}
        placeholder={t('reports.anyRating')}
      />
    </div>
  );
}
