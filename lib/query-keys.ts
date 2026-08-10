export const queryKeys = {
  bootstrap: {
    all: ['bootstrap'] as const,
  },
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
};
