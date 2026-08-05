import { authenticateRequest } from '@/lib/supabase';
import { countCategories, createCategory, listCategories } from '@/lib/db-queries';
import { CategoryInput } from '@/lib/types';
import { MAX_CATEGORIES_PER_USER, validateColor, validateName } from '@/lib/validation';
import { jsonError, jsonOk, readJsonBody, serverError, unauthorized } from '@/lib/api-response';

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  try {
    const categories = await listCategories(auth.client, auth.userId);
    return jsonOk({ categories });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const body = await readJsonBody<CategoryInput>(request);
  if (!body) return jsonError('Invalid JSON body', 400);
  const validationError = validateName(body.name, 100, 'name') ?? validateColor(body.color, true);
  if (validationError) return jsonError(validationError, 400);
  try {
    const total = await countCategories(auth.client, auth.userId);
    if (total >= MAX_CATEGORIES_PER_USER) {
      return jsonError(`Maximum of ${MAX_CATEGORIES_PER_USER} categories reached`, 409);
    }
    const category = await createCategory(auth.client, auth.userId, body);
    return jsonOk({ category }, 201);
  } catch (error) {
    return serverError(error);
  }
}
