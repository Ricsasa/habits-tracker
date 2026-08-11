'use client';

import { useRouter } from 'next/navigation';
import { ActivityWithRelations } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useDeleteActivity } from '@/lib/db-queries';
import { formatDuration, formatRating } from '@/lib/locale-utils';
import { translateCategoryName } from '@/lib/translations/categoryNames';
import ActivityCard from '@/components/molecules/ActivityCard';

export interface ReportStats {
  totalMinutes: number;
  count: number;
  averageRating: number;
}

export interface ReportResultsProps {
  activities: ActivityWithRelations[];
  stats: ReportStats;
}

const STAT =
  'border border-border-light bg-surface-secondary p-3 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark';
const LABEL = 'text-xs uppercase font-600 text-content-tertiary dark:text-content-tertiary-dark';

interface CategoryTotal {
  name: string;
  color: string;
  minutes: number;
}

function groupByCategory(activities: ActivityWithRelations[]): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();
  activities.forEach((activity) => {
    const name = activity.category?.name ?? '';
    const entry = totals.get(name) ?? {
      name,
      color: activity.category?.color ?? '#d1d5db',
      minutes: 0,
    };
    entry.minutes += activity.duration_minutes;
    totals.set(name, entry);
  });
  return [...totals.values()].sort((a, b) => b.minutes - a.minutes);
}

function ratingCounts(activities: ActivityWithRelations[]): number[] {
  return [1, 2, 3, 4, 5].map(
    (level) => activities.filter((activity) => activity.rating === level).length
  );
}

export default function ReportResults({ activities, stats }: ReportResultsProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { mutate: deleteActivity } = useDeleteActivity();
  const categoryTotals = groupByCategory(activities);
  const maxMinutes = Math.max(1, ...categoryTotals.map((total) => total.minutes));

  if (activities.length === 0) {
    return (
      <p className="border border-border-light bg-surface-secondary p-10 text-center text-base text-content-secondary rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark dark:text-content-secondary-dark">
        {t('empty.noActivitiesFound')}
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-6 rounded-none min-w-0">
      <div className="grid grid-cols-2 gap-3 rounded-none lg:grid-cols-3">
        <div className={STAT}>
          <p className={LABEL}>{t('reports.totalTime')}</p>
          <p className="text-2xl font-700">{formatDuration(stats.totalMinutes)}</p>
        </div>
        <div className={STAT}>
          <p className={LABEL}>{t('reports.activityCount')}</p>
          <p className="text-2xl font-700">{stats.count}</p>
        </div>
        <div className={STAT}>
          <p className={LABEL}>{t('reports.averageRating')}</p>
          <p className="text-2xl font-700">{formatRating(stats.averageRating, language)}</p>
        </div>
      </div>

      <div className="rounded-none">
        <p className={`${LABEL} mb-3`}>{t('reports.timeByCategory')}</p>
        <div className="flex flex-col gap-2 rounded-none">
          {categoryTotals.map((total) => (
            <div key={total.name} className="rounded-none">
              <div className="flex justify-between rounded-none">
                <span className="text-sm font-600">{translateCategoryName(total.name, t)}</span>
                <span className="text-sm text-content-tertiary dark:text-content-tertiary-dark">
                  {formatDuration(total.minutes)}
                </span>
              </div>
              <div className="h-5 border border-border-medium rounded-none dark:border-border-medium-dark">
                <div
                  style={{
                    backgroundColor: total.color,
                    width: `${(total.minutes / maxMinutes) * 100}%`,
                  }}
                  className="h-full rounded-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-none">
        <p className={`${LABEL} mb-3`}>{t('reports.ratingDistribution')}</p>
        <div className="flex flex-col gap-2 rounded-none">
          {ratingCounts(activities).map((count, index) => (
            <div key={index} className="flex items-center gap-3 rounded-none">
              <span className="w-16 text-sm text-category-rating">
                {'★'.repeat(index + 1)}
              </span>
              <span className="text-sm text-content-tertiary dark:text-content-tertiary-dark">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-none">
        <p className={`${LABEL} mb-3`}>{t('reports.results')}</p>
        <div className="flex flex-col gap-2 rounded-none">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={(id) => router.push(`/activities/${id}/edit`)}
              onDelete={(id) => void deleteActivity(id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
