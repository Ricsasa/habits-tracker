import {
  Activity,
  ActivityInput,
  ActivityWithRelations,
  Category,
  DefaultCategory,
  DefaultTag,
  Tag,
} from '@/lib/types';

export const TEST_USER_ID = 'user-123';

const TIMESTAMPS = { created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' };

export function makeDefaultCategory(overrides: Partial<DefaultCategory> = {}): DefaultCategory {
  return {
    id: 'default-category-1',
    key: 'work',
    name: 'Work',
    color: '#2563eb',
    created_at: TIMESTAMPS.created_at,
    ...overrides,
  };
}

export function makeDefaultTag(overrides: Partial<DefaultTag> = {}): DefaultTag {
  return {
    id: 'default-tag-1',
    default_category_id: 'default-category-1',
    name: 'Meetings',
    color: '#2563eb',
    created_at: TIMESTAMPS.created_at,
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'category-1',
    user_id: TEST_USER_ID,
    name: 'Work',
    color: '#2563eb',
    is_default: true,
    ...TIMESTAMPS,
    ...overrides,
  };
}

export function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 'tag-1',
    user_id: TEST_USER_ID,
    category_id: 'category-1',
    name: 'Meetings',
    color: '#2563eb',
    ...TIMESTAMPS,
    ...overrides,
  };
}

export function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'activity-1',
    user_id: TEST_USER_ID,
    category_id: 'category-1',
    tag_id: null,
    title: 'Standup',
    start_time: '2026-08-04T09:00:00Z',
    end_time: '2026-08-04T09:30:00Z',
    duration_minutes: 30,
    rating: 4,
    notes: null,
    activity_date: '2026-08-04',
    ...TIMESTAMPS,
    ...overrides,
  };
}

export function makeActivityWithRelations(
  overrides: Partial<ActivityWithRelations> = {}
): ActivityWithRelations {
  return {
    ...makeActivity(),
    category: { id: 'category-1', name: 'Work', color: '#2563eb' },
    tag: null,
    ...overrides,
  };
}

export function makeActivityInput(overrides: Partial<ActivityInput> = {}): ActivityInput {
  return {
    title: 'Standup',
    category_id: 'category-1',
    start_time: '2026-08-04T09:00:00Z',
    end_time: '2026-08-04T09:30:00Z',
    rating: 4,
    ...overrides,
  };
}

/**
 * The four seed categories and the tags that belong to them, shaped the way
 * fetchDefaults() reads them out of the global tables.
 */
export function makeDefaultSeed() {
  const defaultCategories = [
    makeDefaultCategory({ id: 'dc-1', key: 'work', name: 'Work', color: '#2563eb' }),
    makeDefaultCategory({ id: 'dc-2', key: 'health', name: 'Health', color: '#16a34a' }),
    makeDefaultCategory({ id: 'dc-3', key: 'personal', name: 'Personal', color: '#f59e0b' }),
    makeDefaultCategory({ id: 'dc-4', key: 'learning', name: 'Learning', color: '#7c3aed' }),
  ];
  const defaultTags = defaultCategories.flatMap((category, index) => [
    makeDefaultTag({
      id: `dt-${index}-a`,
      default_category_id: category.id,
      name: `${category.name} A`,
    }),
    makeDefaultTag({
      id: `dt-${index}-b`,
      default_category_id: category.id,
      name: `${category.name} B`,
    }),
  ]);
  return { defaultCategories, defaultTags };
}

/** The user-owned categories that a completed seed of `defaults` produces. */
export function seededCategories(defaults: DefaultCategory[]): Category[] {
  return defaults.map((category, index) =>
    makeCategory({ id: `category-${index + 1}`, name: category.name, color: category.color })
  );
}

/** The user-owned tags that a completed seed produces for `categories`. */
export function seededTags(defaults: DefaultCategory[], defaultTags: DefaultTag[], categories: Category[]): Tag[] {
  const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));
  const nameById = new Map(defaults.map((category) => [category.id, category.name]));
  return defaultTags.flatMap((tag, index) => {
    const categoryName = nameById.get(tag.default_category_id);
    const categoryId = categoryName ? categoryIdByName.get(categoryName) : undefined;
    if (!categoryId) return [];
    return [makeTag({ id: `tag-${index + 1}`, category_id: categoryId, name: tag.name })];
  });
}
