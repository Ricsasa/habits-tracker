/**
 * @jest-environment node
 */
import { POST } from '@/app/api/bootstrap/route';
import { authenticateRequest } from '@/lib/supabase';
import { createSupabaseMock, SupabaseMock } from '../helpers/supabase-mock';
import {
  TEST_USER_ID,
  makeDefaultSeed,
  seededCategories,
  seededTags,
} from '../helpers/fixtures';
import { jsonRequest } from '../helpers/request';

jest.mock('@/lib/supabase', () => ({
  authenticateRequest: jest.fn(),
}));

const authenticateRequestMock = authenticateRequest as jest.Mock;
const { defaultCategories, defaultTags } = makeDefaultSeed();
const allCategories = seededCategories(defaultCategories);
const allTags = seededTags(defaultCategories, defaultTags, allCategories);

function authenticateWith(mock: SupabaseMock) {
  authenticateRequestMock.mockResolvedValue({ client: mock.client, userId: TEST_USER_ID });
}

async function post() {
  const response = await POST(jsonRequest('/api/bootstrap', 'POST'));
  return { status: response.status, body: await response.json() };
}

// Failure detail now lives in the server log rather than the response body, so
// the assertions read it back from here.
let errorSpy: jest.SpyInstance;

function loggedDetail(): string {
  return errorSpy.mock.calls.map((call) => String(call[0])).join('\n');
}

beforeEach(() => {
  jest.clearAllMocks();
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('POST /api/bootstrap', () => {
  it('returns 401 when the request has no valid auth context', async () => {
    authenticateRequestMock.mockResolvedValue(null);

    const { status, body } = await post();

    expect(status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('fails loudly when default_categories comes back empty', async () => {
    // an empty global table means an unseeded database or a missing RLS SELECT
    // policy, never a legitimate no-op
    const mock = createSupabaseMock({
      selects: { default_categories: [[]], default_tags: [defaultTags] },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(500);
    expect(body.error).toBe('Internal server error');
    expect(loggedDetail()).toContain('default_categories returned 0 rows');
  });

  it('fails loudly when default_tags comes back empty', async () => {
    const mock = createSupabaseMock({
      selects: { default_categories: [defaultCategories], default_tags: [[]] },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(500);
    expect(body.error).toBe('Internal server error');
    expect(loggedDetail()).toContain('default_tags returned 0 rows');
  });

  it('seeds every default category and tag for a brand new user', async () => {
    const mock = createSupabaseMock({
      selects: {
        default_categories: [defaultCategories],
        default_tags: [defaultTags],
        categories: [[], allCategories],
        tags: [[], allTags],
      },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(200);
    expect(body).toEqual({
      seeded: true,
      categoriesCreated: defaultCategories.length,
      tagsCreated: allTags.length,
    });
    expect(mock.upsertsFor('categories')[0].rows).toHaveLength(defaultCategories.length);
    expect(mock.upsertsFor('categories')[0].options).toEqual({
      onConflict: 'user_id,name',
      ignoreDuplicates: true,
    });
    expect(mock.upsertsFor('tags')[0].options).toEqual({
      onConflict: 'user_id,category_id,name',
      ignoreDuplicates: true,
    });
  });

  it('writes only the categories the user is missing', async () => {
    const existing = allCategories.slice(0, 2);
    const mock = createSupabaseMock({
      selects: {
        default_categories: [defaultCategories],
        default_tags: [defaultTags],
        categories: [existing, allCategories],
        tags: [allTags.slice(0, 4), allTags],
      },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(200);
    expect(body.categoriesCreated).toBe(2);
    const inserted = mock.upsertsFor('categories')[0].rows.map((row) => row.name);
    expect(inserted).toEqual([defaultCategories[2].name, defaultCategories[3].name]);
  });

  it('reports nothing seeded when the user already has the full set', async () => {
    const mock = createSupabaseMock({
      selects: {
        default_categories: [defaultCategories],
        default_tags: [defaultTags],
        categories: [allCategories],
        tags: [allTags],
      },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(200);
    expect(body).toEqual({ seeded: false, categoriesCreated: 0, tagsCreated: 0 });
    expect(mock.upsertsFor('categories')).toHaveLength(0);
    expect(mock.upsertsFor('tags')).toHaveLength(0);
  });

  it('completes the tags when the categories are already in place', async () => {
    const mock = createSupabaseMock({
      selects: {
        default_categories: [defaultCategories],
        default_tags: [defaultTags],
        categories: [allCategories],
        tags: [[], allTags],
      },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(200);
    expect(body).toEqual({ seeded: true, categoriesCreated: 0, tagsCreated: allTags.length });
    // every tag row is addressed by real category id, resolved through the
    // default category's English name
    const validIds = new Set(allCategories.map((category) => category.id));
    for (const row of mock.upsertsFor('tags')[0].rows) {
      expect(validIds.has(row.category_id as string)).toBe(true);
    }
  });

  it('throws when the re-read shows fewer rows written than were missing', async () => {
    // the upsert reports no error but the follow-up read proves only part of the
    // batch landed, which must not be reported as a successful seed
    const mock = createSupabaseMock({
      selects: {
        default_categories: [defaultCategories],
        default_tags: [defaultTags],
        categories: [[], allCategories.slice(0, 3)],
        tags: [[], allTags],
      },
    });
    authenticateWith(mock);

    const { status, body } = await post();

    expect(status).toBe(500);
    expect(body.error).toBe('Internal server error');
    expect(loggedDetail()).toContain('Category seeding wrote 3 of 4 missing default categories.');
  });
});
