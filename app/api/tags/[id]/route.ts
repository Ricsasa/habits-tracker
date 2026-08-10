import { authenticateRequest } from '@/lib/supabase';
import { deleteTag, updateTag } from '@/lib/db-server';
import { TagInput } from '@/lib/types';
import { validateColor, validateName } from '@/lib/validation';
import {
  jsonError,
  jsonOk,
  notFound,
  readJsonBody,
  serverError,
  unauthorized,
} from '@/lib/api-response';

type RouteContext = { params: Promise<{ id: string }> };

function buildPatch(body: Partial<TagInput>): Partial<TagInput> {
  const patch: Partial<TagInput> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.color !== undefined) patch.color = body.color;
  if (body.category_id !== undefined) patch.category_id = body.category_id;
  return patch;
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await context.params;
  const body = await readJsonBody<Partial<TagInput>>(request);
  if (!body) return jsonError('Invalid JSON body', 400);
  const validationError =
    (body.name !== undefined ? validateName(body.name, 50, 'name') : null) ??
    validateColor(body.color, false);
  if (validationError) return jsonError(validationError, 400);
  const patch = buildPatch(body);
  if (Object.keys(patch).length === 0) return jsonError('No fields to update', 400);
  try {
    const tag = await updateTag(auth.client, auth.userId, id, patch);
    if (!tag) return notFound('Tag');
    return jsonOk({ tag });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await context.params;
  try {
    const deleted = await deleteTag(auth.client, auth.userId, id);
    if (!deleted) return notFound('Tag');
    return jsonOk({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
