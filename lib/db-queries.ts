import { SupabaseClient } from '@supabase/supabase-js';
import {
  Activity,
  ActivityInput,
  ActivityWithRelations,
  Category,
  CategoryInput,
  Language,
  ReportFilters,
  Tag,
  TagInput,
  Theme,
  UserSettings,
} from './types';

const ACTIVITY_SELECT =
  '*, category:categories(id, name, color), tag:tags(id, name, color)';

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export async function listCategories(client: SupabaseClient, userId: string): Promise<Category[]> {
  return unwrap(
    await client.from('categories').select('*').eq('user_id', userId).order('created_at')
  );
}

export async function countCategories(client: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await client
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createCategory(
  client: SupabaseClient,
  userId: string,
  input: CategoryInput
): Promise<Category> {
  const row = { user_id: userId, name: input.name.trim(), color: input.color, is_default: false };
  return unwrap(await client.from('categories').insert(row).select('*').single());
}

export async function updateCategory(
  client: SupabaseClient,
  userId: string,
  categoryId: string,
  patch: Partial<CategoryInput>
): Promise<Category | null> {
  const { data, error } = await client
    .from('categories')
    .update(patch)
    .eq('id', categoryId)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Category | null;
}

export async function deleteCategory(
  client: SupabaseClient,
  userId: string,
  categoryId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

export async function listTags(
  client: SupabaseClient,
  userId: string,
  categoryId?: string
): Promise<Tag[]> {
  let query = client.from('tags').select('*').eq('user_id', userId);
  if (categoryId) query = query.eq('category_id', categoryId);
  return unwrap(await query.order('name'));
}

export async function createTag(
  client: SupabaseClient,
  userId: string,
  input: TagInput
): Promise<Tag> {
  const row = {
    user_id: userId,
    category_id: input.category_id,
    name: input.name.trim(),
    color: input.color ?? '#e5e7eb',
  };
  return unwrap(await client.from('tags').insert(row).select('*').single());
}

export async function updateTag(
  client: SupabaseClient,
  userId: string,
  tagId: string,
  patch: Partial<TagInput>
): Promise<Tag | null> {
  const { data, error } = await client
    .from('tags')
    .update(patch)
    .eq('id', tagId)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Tag | null;
}

export async function deleteTag(
  client: SupabaseClient,
  userId: string,
  tagId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('tags')
    .delete()
    .eq('id', tagId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

export async function listActivities(
  client: SupabaseClient,
  userId: string,
  activityDate?: string
): Promise<ActivityWithRelations[]> {
  let query = client.from('activities').select(ACTIVITY_SELECT).eq('user_id', userId);
  if (activityDate) query = query.eq('activity_date', activityDate);
  return unwrap(await query.order('start_time', { ascending: false }));
}

export async function getActivity(
  client: SupabaseClient,
  userId: string,
  activityId: string
): Promise<Activity | null> {
  const { data, error } = await client
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Activity | null;
}

function toActivityRow(userId: string, input: ActivityInput) {
  return {
    user_id: userId,
    category_id: input.category_id,
    tag_id: input.tag_id ?? null,
    title: input.title.trim(),
    start_time: input.start_time,
    end_time: input.end_time,
    rating: input.rating ?? 0,
    notes: input.notes ?? null,
    activity_date: input.activity_date ?? input.start_time.slice(0, 10),
  };
}

export async function createActivity(
  client: SupabaseClient,
  userId: string,
  input: ActivityInput
): Promise<Activity> {
  const row = toActivityRow(userId, input);
  return unwrap(await client.from('activities').insert(row).select('*').single());
}

export async function updateActivity(
  client: SupabaseClient,
  userId: string,
  activityId: string,
  input: ActivityInput
): Promise<Activity | null> {
  const row = toActivityRow(userId, input);
  const { data, error } = await client
    .from('activities')
    .update(row)
    .eq('id', activityId)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Activity | null;
}

export async function deleteActivity(
  client: SupabaseClient,
  userId: string,
  activityId: string
): Promise<boolean> {
  const { data, error } = await client
    .from('activities')
    .delete()
    .eq('id', activityId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

export async function filterActivities(
  client: SupabaseClient,
  userId: string,
  filters: ReportFilters
): Promise<ActivityWithRelations[]> {
  let query = client.from('activities').select(ACTIVITY_SELECT).eq('user_id', userId);
  if (filters.startDate) query = query.gte('activity_date', filters.startDate);
  if (filters.endDate) query = query.lte('activity_date', filters.endDate);
  if (filters.categoryIds?.length) query = query.in('category_id', filters.categoryIds);
  if (filters.tagIds?.length) query = query.in('tag_id', filters.tagIds);
  if (filters.minRating !== undefined) query = query.gte('rating', filters.minRating);
  if (filters.titleSearch) query = query.ilike('title', `%${filters.titleSearch}%`);
  return unwrap(await query.order('activity_date', { ascending: false }));
}

export async function getUserSettings(
  client: SupabaseClient,
  userId: string
): Promise<UserSettings | null> {
  const { data, error } = await client
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as UserSettings | null;
}

export async function upsertUserSettings(
  client: SupabaseClient,
  userId: string,
  patch: { language?: Language; theme?: Theme }
): Promise<UserSettings> {
  return unwrap(
    await client
      .from('user_settings')
      .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
      .select('*')
      .single()
  );
}
