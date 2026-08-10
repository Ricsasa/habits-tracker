import { create } from 'zustand';
import { ReportFilters } from './types';
import { todayIso } from './locale-utils';

export interface UiState {
  selectedDate: string;
  reportFilters: ReportFilters;
  setSelectedDate: (date: string) => void;
  setReportFilters: (filters: ReportFilters) => void;
}

export const useAppStore = create<UiState>((set) => ({
  selectedDate: todayIso(),
  reportFilters: {},
  setSelectedDate: (date) => set({ selectedDate: date }),
  setReportFilters: (filters) => set({ reportFilters: filters }),
}));
