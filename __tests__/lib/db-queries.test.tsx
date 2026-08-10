import { renderHook, waitFor } from '@testing-library/react';
import { UseMutationResult } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import {
  useActivities,
  useCreateActivity,
  useCreateTag,
  useDeleteCategory,
  useSetLanguage,
  useTags,
} from '@/lib/db-queries';
import { queryKeys } from '@/lib/query-keys';
import { createWrapper } from '../helpers/query-wrapper';
import { makeActivityInput, makeActivityWithRelations } from '../helpers/fixtures';

jest.mock('@/lib/api-client', () => ({
  apiRequest: jest.fn(),
  authHeaders: jest.fn(async () => ({ 'Content-Type': 'application/json' })),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: jest.fn(async () => ({ data: { session: null } })) } },
}));

const apiRequestMock = apiRequest as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('query hooks', () => {
  it('requests the dated activities path and returns the payload', async () => {
    const activities = [makeActivityWithRelations()];
    apiRequestMock.mockResolvedValue({ activities });
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useActivities('2026-08-04'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiRequestMock).toHaveBeenCalledWith('/api/activities?date=2026-08-04', 'GET');
    expect(result.current.data).toEqual(activities);
  });

  it('requests the unscoped path and caches under activities.all when no date is given', async () => {
    apiRequestMock.mockResolvedValue({ activities: [] });
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useActivities(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiRequestMock).toHaveBeenCalledWith('/api/activities', 'GET');
    expect(queryClient.getQueryData(queryKeys.activities.all)).toEqual([]);
  });

  it('scopes the tags request by category_id only when one is given', async () => {
    apiRequestMock.mockResolvedValue({ tags: [] });
    const { wrapper } = createWrapper();

    const scoped = renderHook(() => useTags('category-1'), { wrapper });
    await waitFor(() => expect(scoped.result.current.isSuccess).toBe(true));
    expect(apiRequestMock).toHaveBeenCalledWith('/api/tags?category_id=category-1', 'GET');

    const unscoped = renderHook(() => useTags(), { wrapper });
    await waitFor(() => expect(unscoped.result.current.isSuccess).toBe(true));
    expect(apiRequestMock).toHaveBeenLastCalledWith('/api/tags', 'GET');
  });
});

describe('mutation invalidation', () => {
  async function runMutation<TVariables>(
    useHook: () => UseMutationResult<unknown, Error, TVariables, unknown>,
    variables: TVariables
  ) {
    const { wrapper, queryClient } = createWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(useHook, { wrapper });

    result.current.mutate(variables);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    return invalidateQueries.mock.calls.map(([options]) => options?.queryKey);
  }

  it.each([
    {
      name: 'useCreateActivity invalidates activities.all',
      hook: useCreateActivity,
      variables: makeActivityInput(),
      response: { activity: { id: 'activity-1' } },
      expected: [queryKeys.activities.all],
    },
    {
      name: 'useSetLanguage invalidates settings.language',
      hook: useSetLanguage,
      variables: 'es' as const,
      response: { language: 'es' },
      expected: [queryKeys.settings.language()],
    },
  ])('$name', async ({ hook, variables, response, expected }) => {
    apiRequestMock.mockResolvedValue(response);
    const keys = await runMutation(hook as never, variables as never);
    expect(keys).toEqual(expected);
  });

  it('invalidates both categories and tags when a category is deleted', async () => {
    apiRequestMock.mockResolvedValue({ success: true });

    const keys = await runMutation(useDeleteCategory, 'category-1');

    // deleting a category cascades to its tags, so a stale tags cache would keep
    // showing tags whose category no longer exists
    expect(keys).toEqual([queryKeys.categories.all, queryKeys.tags.all]);
  });

  it('derives the tags key from the mutation variables when a tag is created', async () => {
    apiRequestMock.mockResolvedValue({ tag: { id: 'tag-1' } });

    const keys = await runMutation(useCreateTag, {
      category_id: 'category-7',
      name: 'Deep work',
      color: '#2563eb',
    });

    expect(keys).toEqual([queryKeys.tags.byCategory('category-7'), queryKeys.tags.all]);
  });
});
