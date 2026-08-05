import { authenticateRequest } from '@/lib/supabase';
import { deleteCategory, updateCategory } from '@/lib/db-queries';
import { CategoryInput } from '@/lib/types';
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

function buildPatch(body: Partial<CategoryInput>): Partial<CategoryInput> {
  const patch: Partial<CategoryInput> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.color !== undefined) patch.color = body.color;
  return patch;
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await context.params;
  const body = await readJsonBody<Partial<CategoryInput>>(request);
  if (!body) return jsonError('Invalid JSON body', 400);
  const validationError =
    (body.name !== undefined ? validateName(body.name, 100, 'name') : null) ??
    validateColor(body.color, false);
  if (validationError) return jsonError(validationError, 400);
  const patch = buildPatch(body);
  if (Object.keys(patch).length === 0) return jsonError('No fields to update', 400);
  try {
    const category = await updateCategory(auth.client, auth.userId, id, patch);
    if (!category) return notFound('Category');
    return jsonOk({ category });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const { id } = await context.params;
  try {
    const deleted = await deleteCategory(auth.client, auth.userId, id);
    if (!deleted) return notFound('Category');
    return jsonOk({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
