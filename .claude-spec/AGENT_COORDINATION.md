# Agent Coordination & Handoff

## Agent Execution Order

```
Phase 1: Agent Backend (MUST complete first)
    ↓ generates files
    ├── lib/types.ts
    ├── lib/supabase.ts
    ├── lib/db-queries.ts
    └── app/api/ (15 endpoints)
    ↓
Phase 2: Agent Frontend (depends on Backend output)
    ├── Reads types.ts
    ├── Uses API routes
    └── Builds UI
    ↓
Phase 3: Manual Integration & Testing (you)
```

---

## Agent Backend Output Checklist

Agent Backend **must** deliver:

**Files:**
- lib/types.ts (Activity, Category, Tag, UserSettings with all fields)
- lib/supabase.ts (client initialized)
- lib/db-queries.ts (CRUD helpers)
- 15 API routes under app/api/

**Validations:**
- title field: VARCHAR(255) NULL (optional)
- rating: INT CHECK (0-5)
- start_time < end_time always
- Max 7 categories per user
- user_id isolation in all queries
- RLS policies applied
- Triggers working (updated_at)

**Code Quality:**
- Zero comments
- Functions under 20 lines
- Clear variable names
- TypeScript strict mode

---

## Agent Frontend Dependencies

Agent Frontend **requires**:

**From Backend:**
- types.ts (TypeScript interfaces)
- supabase.ts (client instance)
- db-queries.ts (fetch/create/update/delete functions)
- API routes (all 15 endpoints functional)

**Validation Points:**
1. Import types.ts without errors
2. Call each API endpoint and receive 200 response
3. RLS policies block unauthorized users with 401/403

---

## Handoff Validation

Before Agent Frontend starts, verify:

```bash
npx tsc --noEmit
find app/api -name "route.ts" | wc -l
npm run dev
```

---

## Critical Integration Points

| Backend Output | Frontend Uses | Validation |
|---|---|---|
| Activity type | ActivityCard props | Type matches |
| categories API | CategorySelector | Fetches and displays |
| tags API | TagSelector | Filters by category |
| activities API | ActivityForm submit | Creates activity |
| reports API | ReportFilters | Complex query works |

---

## Shared Integration Point: Bootstrap Seeding

Default categories and tags are seeded on first authenticated load, not at signup.
This spans both agents, so the boundary is explicit.

**Agent Backend owns:**
- `app/api/bootstrap/route.ts`, POST only
- Idempotency, per-table verification, insert ordering, referential integrity
- Returns `{ seeded, categoriesCreated, tagsCreated }`

**Agent Frontend owns:**
- `components/BootstrapGate.tsx`
- Calling the endpoint on every authenticated mount
- The static loading state while it is in flight
- Rendering children regardless of outcome, with an error toast on failure

**Neither agent implements the other half.** Frontend does not write seeding SQL or
query `default_categories` directly. Backend does not decide when the call happens.

**Why this failed once already:** the original design put the seed in a helper that
Backend created and Frontend was expected to call. Neither spec said so, so nobody
called it. Cross-agent responsibilities need a named artifact on each side.

**Validation before considering this done:**
1. Register a new account, confirm 4 categories and 19 tags appear
2. Reload — no duplicates
3. Delete some tags manually, reload — only the deleted ones return
4. Rename a default category, reload — it is not re-created
5. Create a custom category, reload — it survives untouched
---

## Failure Scenarios & Recovery

**If Backend is incomplete:**
- Frontend cannot compile (missing types)
- API calls fail (routes do not exist)
- RLS denies access (policies missing)

**Recovery:**
1. Re-run Agent Backend with missing specs
2. Validate types compile
3. Test three random API routes
4. Proceed with Frontend

---

## Future Agent Patterns

For three or more agents, extend this document with:
- Agent dependency graph
- Shared artifact locations
- Validation checkpoints between phases
- Rollback procedures