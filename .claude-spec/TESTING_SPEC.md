# Testing Specification

Unit tests for critical paths: query hooks, mutations, validation, error handling,
invalidation, RLS isolation. UI components (Button, Input, Badge) are trivial —
skip them. i18n is proven by manual testing — skip it.

## Framework & Setup

- **Runner:** Jest
- **React testing:** @testing-library/react
- **TanStack Query testing:** @tanstack/react-query/test-utils (QueryClientProvider wrapper)
- **Mocking:** jest.mock(), no external API calls
- **Coverage target:** >80% on lib/, >60% on components/

## Test Structure

```
__tests__/
├── lib/
│   ├── query-keys.test.ts
│   ├── db-queries.test.ts (query hooks, mutations)
│   ├── types.test.ts (type safety)
│   └── store.test.ts (Zustand UI state)
├── components/
│   ├── ActivityForm.test.tsx (validation, mutation flow)
│   ├── CategorySelector.test.tsx (selection logic)
│   ├── ReportFilters.test.tsx (filter state)
│   └── BootstrapGate.test.tsx (bootstrap flow, error handling)
└── api/
    ├── bootstrap.test.ts (per-table verification, idempotency)
    └── activities.test.ts (validation, RLS, max categories)
```

## What to Test

### lib/query-keys.ts

- Query keys generate correct hierarchical structure
- Keys with same params are identical (dedup)
- Keys with different params are distinct

### lib/db-queries.ts (TanStack Hooks)

**useActivities(date)**
- Returns empty array when no activities
- Returns activities ordered by start_time
- Refetches on invalidation
- Throws on API error (catch and test error state)

**useCategories()**
- Returns 4 defaults on first call
- Caches on second call (no duplicate fetch)
- Invalidation triggers refetch
- Throws when user has no categories

**useCreateActivity()**
- Success: invalidates activities query
- Success: returns activity id
- Validation: accepts empty title, rejects title over 255 chars
- Validation: rejects end_time before start_time
- Validation: rejects rating > 5
- Error: returns error message on server failure

**useDeleteCategory()**
- Success: invalidates both categories AND tags queries
- Validation: rejects if only 1 default category left (future: enforce 7 max)
- Error handling: graceful on orphaned activities

**useSetLanguage()**
- Success: invalidates settings.language query
- Persists to user_settings
- Triggers reload (mock window.location)

### components/ActivityForm.test.tsx

- Title input: required, max 255 chars
- Category selector: disabled until selection
- Date picker: allows past dates, blocks future
- Time pickers: end_time > start_time enforced client-side
- Submit: calls mutation with correct payload
- Success: shows toast, navigates or clears form
- Error: shows error toast, form stays open

### components/BootstrapGate.test.tsx

- Renders loading state while bootstrap in flight
- Calls /api/bootstrap once per mount
- On success: renders children
- On failure: still renders children + error toast (not blocking)
- Multiple mounts: only one bootstrap call (or per-session)

### app/api/bootstrap.test.ts

- User has 0 categories: inserts all 4 defaults
- User has 0 tags: inserts all 19 defaults for their categories
- User has 2 categories: inserts missing 2
- User has 15 tags: inserts missing 4
- User has complete seed: returns { seeded: false, created: 0 }
- Partial seed (categories exist, tags missing): completes tags only
- RLS blocks unauthorized user (auth.uid() mismatch)
- Idempotent: running twice = same data, no dupes

### app/api/activities.test.ts

- POST /api/activities: title optional, max 255 chars
- POST: end_time > start_time or 400 error
- POST: rating 0-5 or 400 error
- POST: category_id must exist and belong to user
- POST: tag_id optional but must belong to user's category if present
- POST: Returns 401 if auth.uid() doesn't match user_id
- PUT /api/activities/[id]: same validations as POST
- DELETE: user can only delete their own activities
- GET: returns only user's activities, ordered by activity_date DESC

### app/api/categories.test.ts

- POST /api/categories: user can create max 3 custom (4 default = 7 total)
- POST: 8th category rejected with clear error
- POST: color must be valid hex or rgb
- DELETE: returns 404 if category doesn't exist or belongs to another user
- DELETE: deletes associated tags and activities (cascade)

## Mock Patterns

### Mocking Supabase

```typescript
jest.mock('@/lib/supabase', () => ({
  useSupabaseClient: jest.fn(() => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [/* mock activities */],
        error: null,
      }),
    }),
  })),
  useSupabaseAuth: jest.fn(() => ({
    user: { id: 'user-123' },
  })),
}))
```

### Mocking TanStack Query

Wrap test components in QueryClientProvider with a fresh client per test:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

render(<YourComponent />, { wrapper })
```

Then use `waitFor` and `screen.getByText` to assert on the DOM after queries settle.

### Mocking API Routes

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ seeded: true, categoriesCreated: 4, tagsCreated: 19 }),
  })
)
```

## Test Patterns to Avoid

- Don't test third-party libraries (don't test @tanstack/react-query internals)
- Don't test Tailwind classes (visual regression is manual)
- Don't test i18n string values (test that t() is called, not the translation)
- Don't test trivial components (Button with no logic)
- Don't test Redux/Zustand action creators directly — test the result via the hook

## Coverage Goals

| Module | Target | Notes |
|---|---|---|
| lib/query-keys.ts | 100% | Small file, every branch |
| lib/db-queries.ts | 80%+ | Focus on hooks, not every edge case |
| lib/store.ts | 70%+ | Zustand UI state, simple but worth covering |
| components/ActivityForm.tsx | 75%+ | Validation + submit flow |
| components/BootstrapGate.tsx | 80%+ | Success/error/loading paths |
| app/api/bootstrap.ts | 85%+ | Per-table logic, idempotency |
| app/api/activities.ts | 80%+ | Validation, RLS, lifecycle |

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
npm test -- <filename>      # Single file
```

## Caveats

- Supabase RLS is tested via API route tests, not directly in hooks (hooks assume valid auth)
- Infinite queries not used, so pagination testing skipped
- Optimistic updates not implemented, so not tested
- Concurrent request race conditions not tested (TanStack handles this)