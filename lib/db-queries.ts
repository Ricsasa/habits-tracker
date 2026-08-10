'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, authHeaders } from './api-client';
import { queryKeys } from './query-keys';
import { supabase } from './supabase';
import {
  Activity,
  ActivityInput,
  ActivityWithRelations,
  Category,
  CategoryInput,
  Language,
  ReportFilters,
  Tag,
  TagInput,
} from './types';

export interface ReportSummary {
  total: number;
  totalMinutes: number;
  averageRating: number;
}

export interface ReportPayload {
  activities: ActivityWithRelations[];
  summary: ReportSummary;
}

export type BootstrapStatus = 'ready' | 'unauthenticated';

async function runBootstrap(): Promise<BootstrapStatus> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) return 'unauthenticated';
  const response = await fetch('/api/bootstrap', {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (response.status === 401) return 'unauthenticated';
  if (!response.ok) throw new Error('bootstrap_failed');
  return 'ready';
}

export function useBootstrap() {
  return useQuery({
    queryKey: queryKeys.bootstrap.all,
    queryFn: runBootstrap,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

function activitiesPath(date?: string): string {
  return date ? `/api/activities?date=${date}` : '/api/activities';
}

async function fetchActivities(date?: string): Promise<ActivityWithRelations[]> {
  const { activities } = await apiRequest<{ activities: ActivityWithRelations[] }>(
    activitiesPath(date),
    'GET'
  );
  return activities;
}

export function useActivities(date?: string) {
  return useQuery({
    queryKey: date ? queryKeys.activities.byDate(date) : queryKeys.activities.all,
    queryFn: () => fetchActivities(date),
  });
}

export function useActivity(activityId: string) {
  return useQuery({
    queryKey: queryKeys.activities.byId(activityId),
    queryFn: async () => {
      const activities = await fetchActivities();
      return activities.find((activity) => activity.id === activityId) ?? null;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const { categories } = await apiRequest<{ categories: Category[] }>('/api/categories', 'GET');
      return categories;
    },
  });
}

export function useTags(categoryId?: string) {
  return useQuery({
    queryKey: categoryId ? queryKeys.tags.byCategory(categoryId) : queryKeys.tags.all,
    queryFn: async () => {
      const path = categoryId ? `/api/tags?category_id=${categoryId}` : '/api/tags';
      const { tags } = await apiRequest<{ tags: Tag[] }>(path, 'GET');
      return tags;
    },
  });
}

export function useLanguageSetting() {
  return useQuery({
    queryKey: queryKeys.settings.language(),
    queryFn: async () => {
      const { language } = await apiRequest<{ language: Language }>(
        '/api/settings/language',
        'GET'
      );
      return language;
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ActivityInput) => {
      const { activity } = await apiRequest<{ activity: Activity }>(
        '/api/activities',
        'POST',
        input
      );
      return activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ActivityInput }) => {
      const { activity } = await apiRequest<{ activity: Activity }>(
        `/api/activities/${id}`,
        'PUT',
        input
      );
      return activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiRequest<{ success: boolean }>(`/api/activities/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) =>
      apiRequest<{ category: Category }>('/api/categories', 'POST', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CategoryInput> }) =>
      apiRequest<{ category: Category }>(`/api/categories/${id}`, 'PUT', patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiRequest<{ success: boolean }>(`/api/categories/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TagInput) => apiRequest<{ tag: Tag }>('/api/tags', 'POST', input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.byCategory(variables.category_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TagInput> }) =>
      apiRequest<{ tag: Tag }>(`/api/tags/${id}`, 'PUT', patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiRequest<{ success: boolean }>(`/api/tags/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useFilterReports() {
  return useMutation({
    mutationFn: (filters: ReportFilters) =>
      apiRequest<ReportPayload>('/api/reports/filter', 'POST', filters),
  });
}

export function useSetLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: Language) =>
      apiRequest<{ language: Language }>('/api/settings/language', 'PUT', { language }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.language() });
    },
  });
}
