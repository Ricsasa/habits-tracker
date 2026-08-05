# Component Specification

Visual reference lives in DESIGN_SYSTEM.md and the screenshots under screens/.
This document defines behavior, props, and structure.

## Global Rules

- `rounded-none` explicit on every container
- No `transition-*`, no `animate-*`, no animation libraries
- Hover and focus expressed through color and border only
- Every visible string through `t()`
- Props typed with an explicit interface, no inline object types
- Component files under 150 lines, functions under 20
- Zero comments

---

## Providers

### LanguageProvider
Wraps the app. Resolves language per MULTILANGUAGE.md, exposes `language`,
`setLanguage`, `t`, `isLoading`. Setting language persists to the API then reloads.

### ThemeProvider
`next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`.

### ToastProvider
Holds a toast queue. Exposes `showToast(message, variant)`. Toasts stack, never
replace. Each auto-dismisses after 4000ms.

---

## Atoms

### Button
```
variant: 'primary' | 'secondary' | 'ghost' | 'destructive'
disabled?: boolean
type?: 'button' | 'submit'
onClick?: () => void
children: ReactNode
```
No loading spinner state. While a request is in flight, disable and swap the label
to `t('common.loading')`.

### Input
```
value: string
onChange: (value: string) => void
placeholder?: string
type?: 'text' | 'email' | 'password'
error?: string
maxLength?: number
required?: boolean
```
Error renders below the field as text, with the border switching to the error color.

### Select
```
value: string
onChange: (value: string) => void
options: Array<{ value: string; label: string }>
placeholder?: string
disabled?: boolean
```

### TimePicker
```
value: string        // HH:mm
onChange: (value: string) => void
label: string
```
Native `<input type="time">`, styled square.

### DatePicker
```
value: string        // YYYY-MM-DD
onChange: (value: string) => void
max?: string
```
Native `<input type="date">`. Past dates allowed and expected. Future dates blocked
by passing today as `max`.

### RatingStars
```
rating: number       // 0-5, 0 means unrated
onChange?: (rating: number) => void
readOnly?: boolean
size?: 'sm' | 'md'
```
Interactive when `onChange` is present. Clicking the current value clears it back to
0. Read-only mode renders no buttons. Needs an accessible label stating the value.

### Badge
```
label: string
color?: string
```
Used for tags. Square, 1px border, no background fill.

### Toast
```
message: string
variant: 'success' | 'error'
onDismiss: () => void
```
Fixed corner position, does not overlap the primary action. Explicit dismiss control
plus 4s auto-dismiss. `role="status"` for success, `role="alert"` for error — required,
since there is no animation to signal the change.

---

## Molecules

### CategorySelector
```
categories: Category[]
selectedId: string | null
onSelect: (categoryId: string) => void
```
Square chips, one per category, filled with the category color when selected and
outlined when not. Not a dropdown. Default category names pass through the translation
map; user-created names render as stored.

### TagSelector
```
tags: Tag[]
categoryId: string | null
selectedId: string | null
onSelect: (tagId: string | null) => void
```
Shows only tags belonging to `categoryId`. Disabled with an empty-state message when
no category is chosen. Selection is optional and clearable.

### ActivityForm
```
activity?: Activity          // present means edit mode
categories: Category[]
tags: Tag[]
onSubmit: (input: ActivityInput) => Promise<void>
onCancel: () => void
```
Field order: title, category, tag, date, start time, end time, duration, rating, notes.

Duration is derived from start and end, displayed read-only, never an input.

Client validation before submit:
- title non-empty after trim, max 255 → `messages.titleRequired`
- category selected
- end time strictly after start time → `messages.invalidTimeRange`

Server errors surface as an error toast. Success fires a success toast and returns
to the dashboard.

### ActivityCard
```
activity: ActivityWithRelations
onEdit: (id: string) => void
onDelete: (id: string) => void
```
Layout: category color indicator, title as primary text, time range, duration,
rating, truncated note. Delete asks for confirmation first.

### ReportFilters
```
categories: Category[]
tags: Tag[]
value: ReportFilters
onChange: (filters: ReportFilters) => void
```
Category multi-select, tag multi-select scoped to selected categories, date range,
minimum rating. Filters apply on change, no submit button.

### LanguageToggle
Square segmented control, two options. Persists then reloads.

### ThemeToggle
Square segmented control, three options: light, dark, system.

---

## Organisms

### DailyActivitiesList
```
activities: ActivityWithRelations[]
date: string
onDateChange: (date: string) => void
```
Header with the localized date, total logged time, activity count. Chronological list
ordered by start time. Previous and next day navigation, next disabled on today.
Empty state uses `empty.noActivitiesToday`.

### CategoriesPanel
```
categories: Category[]
tags: Tag[]
```
Categories listed with color, name, tag count. Tags nested beneath their parent.
Create, edit, delete for both. At seven categories the create action is disabled with
`messages.categoryLimitReached` shown inline. Deleting a category warns that its tags
and activities go with it.

### ReportResults
```
activities: ActivityWithRelations[]
stats: { totalMinutes: number; count: number; averageRating: number }
```
Summary stats, square-ended bars for time per category, rating distribution across
five levels, then the results list. Empty state uses `empty.noActivitiesFound`.

### AuthForm
```
mode: 'login' | 'signup'
```
Email and password, centered, minimal. Errors render inline rather than as toasts.
On signup success, user settings and the copied default categories and tags must
exist before redirecting to the dashboard.

### BootstrapGate
```
children: ReactNode
```
Wraps every authenticated route, mounted inside app/layout.tsx below the providers.

On mount with an active session, POSTs to `/api/bootstrap`. While in flight, renders
a static block with `t('common.settingUpData')` — plain text, no spinner, no pulse,
no transition, per the zero-animation rule. On success, renders children. On failure,
renders children anyway and fires an error toast with `messages.bootstrapFailed`.

A failed bootstrap must never lock the user out. Missing default categories degrade
the experience; a blocked app ends it.

Runs on every authenticated mount, not just the first. The endpoint is idempotent, so
repeated calls are cheap and repair incomplete seeds.

Renders nothing and calls nothing when there is no session — the auth routes sit
outside this gate.

---


## Pages

| Route | Composition |
|---|---|
| `/` | DailyActivitiesList, add action |
| `/activities/add` | ActivityForm, create mode |
| `/activities/[id]/edit` | ActivityForm, edit mode |
| `/reports` | ReportFilters, ReportResults |
| `/categories` | CategoriesPanel |
| `/settings` | LanguageToggle, ThemeToggle, sign out |
| `/auth/login` | AuthForm login |
| `/auth/signup` | AuthForm signup |

All routes except `/auth/login` and `/auth/signup` render inside BootstrapGate.

Every route except the two auth routes requires a session and redirects to
`/auth/login` when absent.

---

## Responsive

Primary target 390px. On desktop the dashboard widens and report filters sit beside
results instead of stacked above. Both languages must be checked at 390px, since
Spanish strings run longer.

---

## Accessibility

- Form inputs have associated labels
- Focus visible through border and color, never removed
- RatingStars announces its current value
- Toasts carry `role="status"` or `role="alert"`
- Color is never the only signal — category chips carry text, rating carries a number