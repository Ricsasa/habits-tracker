import { authenticateRequest } from '@/lib/supabase';
import { getUserSettings, upsertUserSettings } from '@/lib/db-server';
import { Language } from '@/lib/types';
import { jsonError, jsonOk, readJsonBody, serverError, unauthorized } from '@/lib/api-response';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es'];

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  try {
    const settings = await getUserSettings(auth.client, auth.userId);
    return jsonOk({ language: settings?.language ?? 'en' });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const body = await readJsonBody<{ language?: Language }>(request);
  if (!body?.language || !SUPPORTED_LANGUAGES.includes(body.language)) {
    return jsonError("language must be 'en' or 'es'", 400);
  }
  try {
    const settings = await upsertUserSettings(auth.client, auth.userId, { language: body.language });
    return jsonOk({ language: settings.language });
  } catch (error) {
    return serverError(error);
  }
}
