'use client';

import { Category, Tag } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { translateCategoryName, translateTagName } from '@/lib/translations/categoryNames';
import Icon from '@/components/atoms/Icon';

export interface CategoryRowProps {
  category: Category;
  tags: Tag[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddTag: (category: Category) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
}

const ACTION =
  'flex h-7 w-7 items-center justify-center border border-border-light bg-surface-primary text-content-primary rounded-none hover:bg-surface-tertiary dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark dark:hover:bg-surface-tertiary-dark';
const ACTION_DANGER = `${ACTION} hover:border-red-600 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-500`;

export default function CategoryRow({
  category,
  tags,
  onEdit,
  onDelete,
  onAddTag,
  onEditTag,
  onDeleteTag,
}: CategoryRowProps) {
  const { t } = useLanguage();

  return (
    <div className="border border-border-light p-3 rounded-none dark:border-border-light-dark">
      <div className="flex items-center justify-between gap-3 rounded-none">
        <div className="flex items-center gap-2.5 rounded-none">
          <div
            style={{ backgroundColor: category.color }}
            className="h-6 w-6 flex-shrink-0 rounded-none"
          />
          <div className="rounded-none">
            <p className="text-base font-600 text-content-primary dark:text-content-primary-dark">
              {translateCategoryName(category.name, t)}
            </p>
            <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark">
              {t('categoriesPage.tagCount', { count: tags.length })}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2 rounded-none">
          <button
            type="button"
            className={ACTION}
            title={t('buttons.addTag')}
            aria-label={t('buttons.addTag')}
            onClick={() => onAddTag(category)}
          >
            <Icon name="plus" />
          </button>
          <button
            type="button"
            className={ACTION}
            title={t('buttons.edit')}
            aria-label={t('buttons.edit')}
            onClick={() => onEdit(category)}
          >
            <Icon name="pencil" />
          </button>
          <button
            type="button"
            className={ACTION_DANGER}
            title={t('buttons.delete')}
            aria-label={t('buttons.delete')}
            onClick={() => onDelete(category)}
          >
            <Icon name="trash" />
          </button>
        </div>
      </div>

      {tags.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2 border-t border-border-light pt-3 rounded-none dark:border-border-light-dark">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center justify-between gap-3 rounded-none">
              <span className="text-sm text-content-secondary dark:text-content-secondary-dark">
                {translateTagName(tag.name, t)}
              </span>
              <span className="flex gap-2 rounded-none">
                <button
                  type="button"
                  className={ACTION}
                  title={t('buttons.edit')}
                  aria-label={t('buttons.edit')}
                  onClick={() => onEditTag(tag)}
                >
                  <Icon name="pencil" />
                </button>
                <button
                  type="button"
                  className={ACTION_DANGER}
                  title={t('buttons.delete')}
                  aria-label={t('buttons.delete')}
                  onClick={() => onDeleteTag(tag)}
                >
                  <Icon name="trash" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-content-tertiary dark:text-content-tertiary-dark">
          {t('empty.noTagsInCategory')}
        </p>
      )}
    </div>
  );
}
