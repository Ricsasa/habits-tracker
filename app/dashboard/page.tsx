'use client';

import { useEffect } from 'react';
import AppShell from '@/components/AppShell';
import DailyActivitiesList from '@/components/organisms/DailyActivitiesList';
import { useAppStore } from '@/lib/store';

export default function DashboardPage() {
  const activities = useAppStore((state) => state.activities);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const loadActivities = useAppStore((state) => state.loadActivities);

  useEffect(() => {
    void loadActivities(selectedDate);
  }, [loadActivities, selectedDate]);

  return (
    <AppShell>
      <DailyActivitiesList
        activities={activities}
        date={selectedDate}
        onDateChange={(date) => void loadActivities(date)}
      />
    </AppShell>
  );
}
