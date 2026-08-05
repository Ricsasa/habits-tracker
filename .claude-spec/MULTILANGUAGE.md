# Multi-Language Architecture

## Supported Languages

- `en` — English (default)
- `es` — Spanish

## Core Rule

The database stores English. The frontend translates for display.

| Data | Language in DB | Translated on display |
|---|---|---|
| default_categories.name | English | Yes |
| default_tags.name | English | Yes |
| categories created by user | As typed | No |
| tags created by user | As typed | No |
| activity title | As typed | No |
| activity notes | As typed | No |
| UI strings | N/A | Yes |
| Dates | ISO in DB | Yes, via locale |

When a user signs up, default categories and tags are copied into their tables with
the English names from the repository tables. The frontend maps those known English
names to the display language. Anything the user types afterward is stored and shown
verbatim, in whatever language they wrote it.

## Language Resolution Order

1. `user_settings.language` from Supabase, if a row exists
2. `navigator.language` — starts with `es` resolves to `es`, everything else to `en`
3. Fallback `en`

## Changing Language

Language changes are persisted to `user_settings.language`, then the page reloads.
No live re-render, no optimistic update. Reload is intentional and acceptable here.

## File Layout

```
lib/
├── i18n/
│   ├── LanguageContext.tsx
│   └── useLanguage.ts
└── translations/
    ├── en.json
    ├── es.json
    └── categoryNames.ts
```

## Translation Key Structure

Keys are nested by domain. The `t()` function resolves dot notation.

```
common      appName, loading, error, success, cancel, confirm
navigation  dashboard, reports, categories, settings, signOut
buttons     add, save, cancel, delete, edit, addActivity
forms       activityTitle, activityTitlePlaceholder, category,
            selectCategory, tag, selectTag, startTime, endTime,
            duration, date, rating, notes, addNotes
categories  study, exercise, personals, spaces
tags        gym, yoga, pilates, running, dogWalks, treadmill, hike,
            leetcode, aws, nodejs, react, php,
            meditation, socialization, psychology, reading,
            cleaning, cooking, decluttering
messages    activitySaved, activityUpdated, activityDeleted,
            categoryCreated, categoryDeleted, tagCreated, tagDeleted,
            categoryLimitReached, titleRequired, invalidTimeRange
reports     filterByCategory, filterByTag, filterByRating, dateRange,
            from, to, totalTime, activityCount, averageRating, noResults
settings    language, theme, lightMode, darkMode, systemMode, account
dates       today, yesterday, thisWeek, thisMonth
empty       noActivitiesToday, noActivitiesFound, noTagsInCategory
```

Every key must exist in both `en.json` and `es.json`. A missing key returns the key
string itself rather than throwing.

## Mapping Default Names to Translations

`categoryNames.ts` maps the English names stored in the database to translation keys.
Lookups that miss return the original string unchanged, which is what makes
user-created categories pass through untranslated.

```typescript
const DEFAULT_CATEGORY_KEYS: Record<string, string> = {
  'Study': 'categories.study',
  'Exercise': 'categories.exercise',
  'Personal Improvement': 'categories.personals',
  'Spaces': 'categories.spaces'
}

const DEFAULT_TAG_KEYS: Record<string, string> = {
  'gym': 'tags.gym',
  'yoga': 'tags.yoga',
  'dog walks': 'tags.dogWalks'
}
```

Same pattern for the remaining default tags. Any name absent from these maps is
rendered as stored.

## Date Formatting

Dates are formatted through `Intl.DateTimeFormat` with the locale derived from the
active language: `en-US` or `es-ES`. English uses 12-hour time, Spanish uses 24-hour.
No date strings are hardcoded in components.

## Rules for Components

- Never hardcode display text. Every visible string goes through `t()`.
- Never translate values that came from user input.
- Never format a date manually. Use the locale helpers.
- Spanish strings run roughly 20-30% longer than English. Layouts must not break or
  truncate at that length — test both languages on the 390px viewport.