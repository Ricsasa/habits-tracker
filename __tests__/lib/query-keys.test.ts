import { queryKeys } from '@/lib/query-keys';

describe('queryKeys', () => {
  it('builds hierarchical activity keys', () => {
    expect(queryKeys.activities.byDate('2026-08-04')).toEqual([
      'activities',
      { date: '2026-08-04' },
    ]);
    expect(queryKeys.activities.byId('activity-1')).toEqual(['activities', { id: 'activity-1' }]);
  });

  it('prefixes every namespaced key with its .all key', () => {
    const cases: { all: readonly string[]; scoped: readonly unknown[] }[] = [
      { all: queryKeys.activities.all, scoped: queryKeys.activities.byDate('2026-08-04') },
      { all: queryKeys.activities.all, scoped: queryKeys.activities.byId('activity-1') },
      { all: queryKeys.categories.all, scoped: queryKeys.categories.byId('category-1') },
      { all: queryKeys.tags.all, scoped: queryKeys.tags.byCategory('category-1') },
      { all: queryKeys.settings.all, scoped: queryKeys.settings.language() },
    ];

    // invalidateQueries({ queryKey: X.all }) only reaches a scoped key when that
    // key starts with the same segments. A scoped key that drops the prefix stops
    // being invalidated without failing anywhere else.
    for (const { all, scoped } of cases) {
      expect(scoped.slice(0, all.length)).toEqual([...all]);
      expect(scoped.length).toBeGreaterThan(all.length);
    }
  });

  it('distinguishes byDate from byId for the same string', () => {
    expect(queryKeys.activities.byDate('x')).not.toEqual(queryKeys.activities.byId('x'));
  });

  it('appends a string segment for settings.language, not an object', () => {
    expect(queryKeys.settings.language()).toEqual(['settings', 'language']);
  });
});
