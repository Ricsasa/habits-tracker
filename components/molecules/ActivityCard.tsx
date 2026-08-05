'use client';

import { ActivityWithRelations } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { formatDuration, formatTimeRange } from '@/lib/locale-utils';
import { translateTagName } from '@/lib/translations/categoryNames';
import RatingStars from '@/components/atoms/RatingStars';
import Badge from '@/components/atoms/Badge';

export interface ActivityCardProps {
  activity: ActivityWithRelations;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ACTION =
  'border border-border-light bg-surface-primary px-2 py-1 text-xs font-600 text-content-primary rounded-none hover:bg-surface-tertiary dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark dark:hover:bg-surface-tertiary-dark';

export default function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const { t, language } = useLanguage();

  function handleDelete() {
    if (window.confirm(t('messages.confirmDeleteActivity'))) onDelete(activity.id);
  }

  return (
    <div className="flex gap-3 border border-border-light bg-surface-primary p-3 rounded-none dark:border-border-light-dark dark:bg-surface-secondary-dark">
      <div
        style={{ backgroundColor: activity.category?.color ?? '#d1d5db' }}
        className="w-1 flex-shrink-0 rounded-none"
      />
      <div className="flex-1 rounded-none">
        <p className="text-sm font-600 text-content-primary dark:text-content-primary-dark">
          {activity.title}
        </p>
        <p className="text-xs text-content-secondary dark:text-content-secondary-dark">
          {formatTimeRange(activity.start_time, activity.end_time, language)} ·{' '}
          {formatDuration(activity.duration_minutes)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 rounded-none">
          <RatingStars rating={activity.rating} readOnly size="sm" />
          {activity.tag ? (
            <Badge label={translateTagName(activity.tag.name, t)} color={activity.tag.color} />
          ) : null}
        </div>
        {activity.notes ? (
          <p className="mt-1 truncate text-xs text-content-tertiary dark:text-content-tertiary-dark">
            {activity.notes}
          </p>
        ) : null}
      </div>
      <div className="flex flex-shrink-0 flex-col gap-2 rounded-none">
        <button type="button" className={ACTION} onClick={() => onEdit(activity.id)}>
          {t('buttons.edit')}
        </button>
        <button type="button" className={ACTION} onClick={handleDelete}>
          {t('buttons.delete')}
        </button>
      </div>
    </div>
  );
}
