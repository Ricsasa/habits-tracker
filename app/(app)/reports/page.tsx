'use client';

import { useEffect } from 'react';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ReportFilters from '@/components/molecules/ReportFilters';
import ReportResults, { ReportStats } from '@/components/organisms/ReportResults';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { ReportPayload, useCategories, useFilterReports, useTags } from '@/lib/db-queries';
import { useAppStore } from '@/lib/store';

function toStats(report?: ReportPayload): ReportStats {
  return {
    totalMinutes: report?.summary.totalMinutes ?? 0,
    count: report?.summary.total ?? 0,
    averageRating: report?.summary.averageRating ?? 0,
  };
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const filters = useAppStore((state) => state.reportFilters);
  const setFilters = useAppStore((state) => state.setReportFilters);
  const { mutate: runReport, data: report, status } = useFilterReports();
  // 'idle' covers the render before the effect fires, so the zeroed stats never
  // flash before the first request starts.
  const isLoading = status === 'idle' || status === 'pending';

  useEffect(() => {
    runReport(filters, {
      onError: () => showToast(t('common.error'), 'error'),
    });
  }, [filters, runReport, showToast, t]);

  return (
    <>
      <h1 className="band-rule mb-8 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('reports.title')}
      </h1>
      <div className="flex flex-col gap-6 rounded-none lg:grid lg:grid-cols-[300px_1fr] lg:items-start">
        <ReportFilters
          categories={categories}
          tags={tags}
          value={filters}
          onChange={setFilters}
        />
        {isLoading ? (
          <div className="border border-border-light bg-surface-secondary p-10 text-center rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark">
            <LoadingIndicator />
          </div>
        ) : (
          <ReportResults activities={report?.activities ?? []} stats={toStats(report)} />
        )}
      </div>
    </>
  );
}
