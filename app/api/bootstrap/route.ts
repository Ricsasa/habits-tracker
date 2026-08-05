import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateRequest } from '@/lib/supabase';
import { Category, DefaultCategory, DefaultTag, Tag } from '@/lib/types';
import { jsonOk, serverError, unauthorized } from '@/lib/api-response';

class BootstrapError extends Error {}

async function ensureUserSettings(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client
    .from('user_settings')
    .upsert(
      { user_id: userId, language: 'en', theme: 'system' },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );
  if (error) throw error;
}

async function fetchDefaults(client: SupabaseClient) {
  const [categories, tags] = await Promise.all([
    client.from('default_categories').select('*').order('created_at'),
    client.from('default_tags').select('*'),
  ]);
  if (categories.error) throw categories.error;
  if (tags.error) throw tags.error;

  const defaultCategories = (categories.data ?? []) as DefaultCategory[];
  const defaultTags = (tags.data ?? []) as DefaultTag[];

  // A read of a global table that returns zero rows is not a successful no-op.
  // It means either the seed never ran or RLS hides the rows from the caller.
  // Without this guard the endpoint reports a successful seed of nothing.
  if (defaultCategories.length === 0) {
    throw new BootstrapError(
      'default_categories returned 0 rows for the authenticated user. The table is either unseeded or has RLS enabled without a SELECT policy for the authenticated role.'
    );
  }
  if (defaultTags.length === 0) {
    throw new BootstrapError(
      'default_tags returned 0 rows for the authenticated user. The table is either unseeded or has RLS enabled without a SELECT policy for the authenticated role.'
    );
  }
  return { defaultCategories, defaultTags };
}

async function fetchDefaultCategories(client: SupabaseClient, userId: string): Promise<Category[]> {
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true);
  if (error) throw error;
  return (data ?? []) as Category[];
}

async function fetchUserTags(
  client: SupabaseClient,
  userId: string,
  categoryIds: string[]
): Promise<Tag[]> {
  if (categoryIds.length === 0) return [];
  const { data, error } = await client
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .in('category_id', categoryIds);
  if (error) throw error;
  return (data ?? []) as Tag[];
}

async function ensureCategories(
  client: SupabaseClient,
  userId: string,
  defaults: DefaultCategory[]
): Promise<{ categories: Category[]; created: number }> {
  const existing = await fetchDefaultCategories(client, userId);
  const existingNames = new Set(existing.map((category) => category.name));
  const missing = defaults.filter((category) => !existingNames.has(category.name));
  if (missing.length === 0) return { categories: existing, created: 0 };

  const rows = missing.map((category) => ({
    user_id: userId,
    name: category.name,
    color: category.color,
    is_default: true,
  }));
  const { error } = await client
    .from('categories')
    .upsert(rows, { onConflict: 'user_id,name', ignoreDuplicates: true });
  if (error) throw error;

  // Re-read instead of trusting the insert payload: with ignoreDuplicates a
  // concurrent bootstrap can win a row, and the ids are needed for the tags.
  const categories = await fetchDefaultCategories(client, userId);
  const created = categories.length - existing.length;
  if (created < missing.length) {
    throw new BootstrapError(
      `Category seeding wrote ${created} of ${missing.length} missing default categories.`
    );
  }
  return { categories, created };
}

function buildMissingTagRows(
  userId: string,
  defaults: DefaultCategory[],
  defaultTags: DefaultTag[],
  categories: Category[],
  userTags: Tag[]
) {
  // Correspondence goes default category id -> stored English name -> the user's
  // is_default category with that name -> real category id. Never a name match
  // against user input.
  const categoryIdByName = new Map(
    categories
      .filter((category) => category.is_default)
      .map((category) => [category.name, category.id])
  );
  const defaultNameById = new Map(defaults.map((category) => [category.id, category.name]));
  const existing = new Set(userTags.map((tag) => `${tag.category_id}:${tag.name}`));

  return defaultTags.flatMap((tag) => {
    const defaultName = defaultNameById.get(tag.default_category_id);
    const categoryId = defaultName ? categoryIdByName.get(defaultName) : undefined;
    if (!categoryId || existing.has(`${categoryId}:${tag.name}`)) return [];
    return [{ user_id: userId, category_id: categoryId, name: tag.name, color: tag.color }];
  });
}

async function ensureTags(
  client: SupabaseClient,
  userId: string,
  defaults: DefaultCategory[],
  defaultTags: DefaultTag[],
  categories: Category[]
): Promise<number> {
  const ids = categories.map((category) => category.id);
  const existing = await fetchUserTags(client, userId, ids);
  const rows = buildMissingTagRows(userId, defaults, defaultTags, categories, existing);
  if (rows.length === 0) return 0;

  const { error } = await client
    .from('tags')
    .upsert(rows, { onConflict: 'user_id,category_id,name', ignoreDuplicates: true });
  if (error) throw error;

  const after = await fetchUserTags(client, userId, ids);
  const created = after.length - existing.length;
  if (created < rows.length) {
    throw new BootstrapError(`Tag seeding wrote ${created} of ${rows.length} missing default tags.`);
  }
  return created;
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  try {
    await ensureUserSettings(auth.client, auth.userId);
    const { defaultCategories, defaultTags } = await fetchDefaults(auth.client);
    const { categories, created } = await ensureCategories(
      auth.client,
      auth.userId,
      defaultCategories
    );
    const tagsCreated = await ensureTags(
      auth.client,
      auth.userId,
      defaultCategories,
      defaultTags,
      categories
    );
    return jsonOk({
      seeded: created + tagsCreated > 0,
      categoriesCreated: created,
      tagsCreated,
    });
  } catch (error) {
    return serverError(error);
  }
}
