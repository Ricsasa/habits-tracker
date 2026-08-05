'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import ReportFilters from '@/components/molecules/ReportFilters';
import ReportResults from '@/components/organisms/ReportResults';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { runReport, useAppStore } from '@/lib/store';
import { ActivityWithRelations, ReportFilters as ReportFiltersValue } from '@/lib/types';

export default function ReportsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const categories = useAppStore((state) => state.categories);
  const tags = useAppStore((state) => state.tags);
  const loadCategories = useAppStore((state) => state.loadCategories);
  const loadTags = useAppStore((state) => state.loadTags);
  const [filters, setFilters] = useState<ReportFiltersValue>({});
  const [results, setResults] = useState<ActivityWithRelations[]>([]);
  const [stats, setStats] = useState({ totalMinutes: 0, count: 0, averageRating: 0 });

  useEffect(() => {
    void loadCategories();
    void loadTags();
  }, [loadCategories, loadTags]);

  useEffect(() => {
    let active = true;
    runReport(filters)
      .then((report) => {
        if (!active) return;
        setResults(report.activities);
        setStats({
          totalMinutes: report.summary.totalMinutes,
          count: report.summary.total,
          averageRating: report.summary.averageRating,
        });
      })
      .catch(() => {
        if (active) showToast(t('common.error'), 'error');
      });
    return () => {
      active = false;
    };
  }, [filters, showToast, t]);

  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('reports.title')}
      </h1>
      <div className="flex flex-col gap-6 rounded-none lg:grid lg:grid-cols-[300px_1fr] lg:items-start">
        <ReportFilters
          categories={categories}
          tags={tags}
          value={filters}
          onChange={setFilters}
        />
        <ReportResults activities={results} stats={stats} />
      </div>
    </AppShell>
  );
}
