# TanStack Query Architecture

Refactor the data layer from manual fetch + Zustand to TanStack Query for automatic
deduplication, caching, and invalidation.

## Core Principles

- Every fetch is a `useQuery`
- Every POST/PUT/DELETE is a `useMutation`
- Query keys are hierarchical and namespaced
- Invalidation is explicit and predictable
- No manual refetch() calls — mutations handle it

## Query Keys

Namespace everything under domain:

```typescript
const queryKeys = {
  activities: {
    all: ['activities'] as const,
    byDate: (date: string) => [...queryKeys.activities.all, { date }] as const,
    byId: (id: string) => [...queryKeys.activities.all, { id }] as const,
  },
  categories: {
    all: ['categories'] as const,
    byId: (id: string) => [...queryKeys.categories.all, { id }] as const,
  },
  tags: {
    all: ['tags'] as const,
    byCategory: (categoryId: string) => [...queryKeys.tags.all, { categoryId }] as const,
  },
  settings: {
    all: ['settings'] as const,
    language: () => [...queryKeys.settings.all, 'language'] as const,
  },
}
```

## Hooks Structure

Replace `lib/db-queries.ts` with query hooks. Each hook wraps one query or mutation.

### Queries (useQuery)

```typescript
export function useActivities(date: string) {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: queryKeys.activities.byDate(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('activity_date', date)
        .eq('user_id', userId)
        .order('start_time')
      
      if (error) throw error
      return data
    },
  })
}

export function useCategories() {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      // query here
    },
  })
}

export function useTags(categoryId: string) {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: queryKeys.tags.byCategory(categoryId),
    queryFn: async () => {
      // query here, filtered by categoryId
    },
  })
}

export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: async () => {
      // fetch user_settings
    },
  })
}
```

### Mutations (useMutation)

```typescript
export function useCreateActivity() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: ActivityInput) => {
      // POST to /api/activities
    },
    onSuccess: () => {
      // Invalidate activities queries — forces refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & ActivityInput) => {
      // PUT to /api/activities/[id]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // DELETE to /api/activities/[id]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      // POST to /api/categories
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...input }) => {
      // PUT to /api/categories/[id]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // DELETE to /api/categories/[id]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    },
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: { category_id: string; name: string; color?: string }) => {
      // POST to /api/tags
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tags.byCategory(variables.category_id),
      })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...input }) => {
      // PUT to /api/tags/[id]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // DELETE to /api/tags/[id]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    },
  })
}

export function useFilterReports() {
  const supabase = useSupabaseClient()
  
  return useMutation({
    mutationFn: async (filters: ReportFilters) => {
      // POST to /api/reports/filter
    },
  })
}

export function useSetLanguage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (language: Language) => {
      // PUT to /api/settings/language
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.language() })
    },
  })
}
```

## Setup: lib/query-client.ts

Create once, share everywhere.

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // garbage collect after 10 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

## Setup: app/layout.tsx

Wrap providers in order:

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <ToastProvider>
                <BootstrapGate>
                  {children}
                </BootstrapGate>
              </ToastProvider>
            </QueryClientProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Component Patterns

### Using a Query

```typescript
export function DailyActivitiesList() {
  const date = '2026-08-04'
  const { data: activities, isLoading, error } = useActivities(date)
  
  if (isLoading) return <Loading />
  if (error) return <ErrorState />
  
  return <ul>{activities.map(a => <ActivityCard key={a.id} activity={a} />)}</ul>
}
```

### Using a Mutation

```typescript
export function ActivityForm() {
  const { mutate: createActivity, isPending } = useCreateActivity()
  
  const handleSubmit = (input: ActivityInput) => {
    createActivity(input, {
      onSuccess: () => {
        // Success toast already fired from mutation
        // user is navigated elsewhere
      },
    })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## Invalidation Rules

- After creating/updating/deleting an activity → invalidate `activities.all`
- After creating/updating a category → invalidate `categories.all`
- After deleting a category → invalidate `categories.all` AND `tags.all`
- After creating/updating a tag → invalidate `tags.byCategory(categoryId)`
- After deleting a tag → invalidate `tags.all`

Specificity matters: invalidating `activities.all` refetches all dates, not just today.
Invalidating `activities.byDate(date)` refetches only that date. Choose accordingly.

## Zustand for Local UI State

`lib/store.ts` remains and handles client-side UI state only: activeTab, filters,
expanded sections, modal visibility, form draft state, etc.

TanStack Query handles ALL server state (activities, categories, tags, settings).

**Clear boundary:**
- Zustand: UI navigation, UI temporary data, form state before submission
- TanStack Query: anything that came from or goes to the API

Keep the store as-is. Zustand stays. No provider needed — import directly where used.

## Caching Behavior

- First call to `useActivities(date)` → fetch
- Second call to `useActivities(date)` in a different component → cache (instant)
- User refocuses browser tab → background refetch (data updates silently)
- Mutation invalidates → refetch on next render
- 5 minutes of inactivity → mark as stale, next access refetches
- 10 minutes without access → garbage collect

This eliminates duplicate requests and keeps data fresh automatically.