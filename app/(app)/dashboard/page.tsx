'use client';

import DailyActivitiesList from '@/components/organisms/DailyActivitiesList';
import { useActivities } from '@/lib/db-queries';
import { useAppStore } from '@/lib/store';

export default function DashboardPage() {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const { data: activities = [] } = useActivities(selectedDate);

  return (
    <>
      <DailyActivitiesList
        activities={activities}
        date={selectedDate}
        onDateChange={setSelectedDate}
      />
    </>
  );
}
