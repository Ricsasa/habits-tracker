import { create } from 'zustand';
import { supabase } from './supabase';
import {
  Activity,
  ActivityInput,
  ActivityWithRelations,
  Category,
  CategoryInput,
  ReportFilters,
  Tag,
  TagInput,
} from './types';
import { todayIso } from './locale-utils';

export interface ReportSummary {
  total: number;
  totalMinutes: number;
  averageRating: number;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: await authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(payload?.error ?? 'request_failed');
  return payload as T;
}

export async function fetchActivity(id: string): Promise<ActivityWithRelations | null> {
  const { activities } = await request<{ activities: ActivityWithRelations[] }>(
    '/api/activities',
    'GET'
  );
  return activities.find((activity) => activity.id === id) ?? null;
}

export async function runReport(
  filters: ReportFilters
): Promise<{ activities: ActivityWithRelations[]; summary: ReportSummary }> {
  return request('/api/reports/filter', 'POST', filters);
}

export interface AppState {
  categories: Category[];
  tags: Tag[];
  activities: ActivityWithRelations[];
  selectedDate: string;
  isLoading: boolean;
  setSelectedDate: (date: string) => void;
  loadCategories: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadActivities: (date: string) => Promise<void>;
  createActivity: (input: ActivityInput) => Promise<Activity>;
  updateActivity: (id: string, input: ActivityInput) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
  createCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: string, patch: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createTag: (input: TagInput) => Promise<void>;
  updateTag: (id: string, patch: Partial<TagInput>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  categories: [],
  tags: [],
  activities: [],
  selectedDate: todayIso(),
  isLoading: false,

  setSelectedDate: (date) => set({ selectedDate: date }),

  loadCategories: async () => {
    const { categories } = await request<{ categories: Category[] }>('/api/categories', 'GET');
    set({ categories });
  },

  loadTags: async () => {
    const { tags } = await request<{ tags: Tag[] }>('/api/tags', 'GET');
    set({ tags });
  },

  loadActivities: async (date) => {
    set({ isLoading: true, selectedDate: date });
    try {
      const { activities } = await request<{ activities: ActivityWithRelations[] }>(
        `/api/activities?date=${date}`,
        'GET'
      );
      set({ activities });
    } finally {
      set({ isLoading: false });
    }
  },

  createActivity: async (input) => {
    const { activity } = await request<{ activity: Activity }>('/api/activities', 'POST', input);
    await get().loadActivities(get().selectedDate);
    return activity;
  },

  updateActivity: async (id, input) => {
    const { activity } = await request<{ activity: Activity }>(
      `/api/activities/${id}`,
      'PUT',
      input
    );
    await get().loadActivities(get().selectedDate);
    return activity;
  },

  deleteActivity: async (id) => {
    await request(`/api/activities/${id}`, 'DELETE');
    set({ activities: get().activities.filter((activity) => activity.id !== id) });
  },

  createCategory: async (input) => {
    await request('/api/categories', 'POST', input);
    await get().loadCategories();
  },

  updateCategory: async (id, patch) => {
    await request(`/api/categories/${id}`, 'PUT', patch);
    await get().loadCategories();
  },

  deleteCategory: async (id) => {
    await request(`/api/categories/${id}`, 'DELETE');
    await Promise.all([get().loadCategories(), get().loadTags()]);
  },

  createTag: async (input) => {
    await request('/api/tags', 'POST', input);
    await get().loadTags();
  },

  updateTag: async (id, patch) => {
    await request(`/api/tags/${id}`, 'PUT', patch);
    await get().loadTags();
  },

  deleteTag: async (id) => {
    await request(`/api/tags/${id}`, 'DELETE');
    await get().loadTags();
  },
}));
