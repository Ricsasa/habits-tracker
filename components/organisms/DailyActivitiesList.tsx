'use client';

import { useRouter } from 'next/navigation';
import { ActivityWithRelations } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ToastProvider';
import { formatDuration, formatLongDate, shiftIsoDate, todayIso } from '@/lib/locale-utils';
import ActivityCard from '@/components/molecules/ActivityCard';

export interface DailyActivitiesListProps {
  activities: ActivityWithRelations[];
  date: string;
  onDateChange: (date: string) => void;
}

const NAV =
  'border border-border-light bg-surface-primary px-3 py-2 text-xs font-600 text-content-primary rounded-none dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark';
const STAT =
  'flex-1 border border-border-light bg-surface-secondary p-3 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark';

export default function DailyActivitiesList({
  activities,
  date,
  onDateChange,
}: DailyActivitiesListProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { showToast } = useToast();
  const deleteActivity = useAppStore((state) => state.deleteActivity);

  const totalMinutes = activities.reduce((sum, item) => sum + item.duration_minutes, 0);
  const ordered = [...activities].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const isToday = date === todayIso();

  async function handleDelete(id: string) {
    try {
      await deleteActivity(id);
      showToast(t('messages.activityDeleted'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    }
  }

  return (
    <section className="rounded-none">
      <p className="text-base text-content-tertiary dark:text-content-tertiary-dark">
        {isToday ? t('dates.today') : formatLongDate(date, language)}
      </p>
      <h1 className="mb-4 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {formatLongDate(date, language)}
      </h1>

      <div className="mb-4 flex gap-4 rounded-none">
        <div className={STAT}>
          <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark">
            {t('dashboard.totalTime')}
          </p>
          <p className="text-2xl font-700">{formatDuration(totalMinutes)}</p>
        </div>
        <div className={STAT}>
          <p className="text-xs text-content-tertiary dark:text-content-tertiary-dark">
            {t('dashboard.activityCount')}
          </p>
          <p className="text-2xl font-700">{activities.length}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 rounded-none">
        <button type="button" className={NAV} onClick={() => onDateChange(shiftIsoDate(date, -1))}>
          {t('common.previousDay')}
        </button>
        <button
          type="button"
          disabled={isToday}
          className={`${NAV} ${isToday ? 'cursor-not-allowed text-content-tertiary' : ''}`}
          onClick={() => onDateChange(shiftIsoDate(date, 1))}
        >
          {t('common.nextDay')}
        </button>
      </div>

      <p className="mb-3 text-xs font-600 uppercase text-content-tertiary dark:text-content-tertiary-dark">
        {t('dashboard.todaysActivities')}
      </p>

      {ordered.length === 0 ? (
        <p className="border border-border-light bg-surface-secondary p-10 text-center text-base text-content-secondary rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark dark:text-content-secondary-dark">
          {t('empty.noActivitiesToday')}
        </p>
      ) : (
        <div className="flex flex-col gap-3 rounded-none">
          {ordered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={(id) => router.push(`/activities/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
