import { authenticateRequest } from '@/lib/supabase';
import { deleteActivity, getActivity, updateActivity } from '@/lib/db-server';
import { Activity, ActivityInput } from '@/lib/types';
import { validateActivityInput } from '@/lib/validation';
import {
  jsonError,
  jsonOk,
  notFound,
  readJsonBody,
  serverError,
  unauthorized,
} from '@/lib/api-response';

type RouteContext = { params: Promise<{ id: string }> };

function mergeActivity(existing: Activity, patch: Partial<ActivityInput>): ActivityInput {
  return {
    // title is nullable, so an explicit null clears it rather than falling back
    title: patch.title !== undefined ? patch.title : existing.title,
    category_id: patch.category_id ?? existing.category_id,
    tag_id: patch.tag_id !== undefined ? patch.tag_id : existing.tag_id,
    start_time: patch.start_time ?? existing.start_time,
    end_time: patch.end_time ?? existing.end_time,
    rating: patch.rating ?? existing.rating,
    notes: patch.notes !== undefined ? patch.notes : existing.notes,
    activity_date: patch.activity_date ?? existing.activity_date,
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await context.params;
  const body = await readJsonBody<Partial<ActivityInput>>(request);
  if (!body) return jsonError('Invalid JSON body', 400);
  try {
    const existing = await getActivity(auth.client, auth.userId, id);
    if (!existing) return notFound('Activity');
    const merged = mergeActivity(existing, body);
    const validationError = validateActivityInput(merged);
    if (validationError) return jsonError(validationError, 400);
    const activity = await updateActivity(auth.client, auth.userId, id, merged);
    if (!activity) return notFound('Activity');
    return jsonOk({ activity });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await context.params;
  try {
    const deleted = await deleteActivity(auth.client, auth.userId, id);
    if (!deleted) return notFound('Activity');
    return jsonOk({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
