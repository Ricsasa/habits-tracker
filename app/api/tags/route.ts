import { authenticateRequest } from '@/lib/supabase';
import { createTag, listTags } from '@/lib/db-server';
import { TagInput } from '@/lib/types';
import { validateColor, validateName } from '@/lib/validation';
import { jsonError, jsonOk, readJsonBody, serverError, unauthorized } from '@/lib/api-response';

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const categoryId = new URL(request.url).searchParams.get('category_id') ?? undefined;
  try {
    const tags = await listTags(auth.client, auth.userId, categoryId);
    return jsonOk({ tags });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const body = await readJsonBody<TagInput>(request);
  if (!body) return jsonError('Invalid JSON body', 400);
  const validationError =
    validateName(body.name, 50, 'name') ??
    validateColor(body.color, false) ??
    (typeof body.category_id === 'string' && body.category_id.length > 0
      ? null
      : 'category_id is required');
  if (validationError) return jsonError(validationError, 400);
  try {
    const tag = await createTag(auth.client, auth.userId, body);
    return jsonOk({ tag }, 201);
  } catch (error) {
    return serverError(error);
  }
}
