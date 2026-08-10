import { render, screen } from '@testing-library/react';
import ReportsPage from '@/app/(app)/reports/page';

jest.mock('@/lib/db-queries', () => ({
  useCategories: () => ({ data: [] }),
  useTags: () => ({ data: [] }),
  useFilterReports: () => ({ mutate: jest.fn(), data: undefined, status: 'pending' }),
  useDeleteActivity: () => ({ mutate: jest.fn() }),
}));

jest.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/lib/i18n/useLanguage', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'en' }),
}));

jest.mock('@/lib/store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) =>
    selector({ reportFilters: {}, setReportFilters: jest.fn() }),
}));

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
});

test('reports page renders loading indicator while pending', () => {
  render(<ReportsPage />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
