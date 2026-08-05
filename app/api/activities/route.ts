import { authenticateRequest } from '@/lib/supabase';
import { createActivity, listActivities } from '@/lib/db-queries';
import { ActivityInput } from '@/lib/types';
import { validateActivityInput } from '@/lib/validation';
import { jsonError, jsonOk, readJsonBody, serverError, unauthorized } from '@/lib/api-response';

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const activityDate = new URL(request.url).searchParams.get('date') ?? undefined;
  try {
    const activities = await listActivities(auth.client, auth.userId, activityDate);
    return jsonOk({ activities });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const body = await readJsonBody<ActivityInput>(request);
  if (!body) return jsonError('Invalid JSON body', 400);
  const validationError = validateActivityInput(body);
  if (validationError) return jsonError(validationError, 400);
  try {
    const activity = await createActivity(auth.client, auth.userId, body);
    return jsonOk({ activity }, 201);
  } catch (error) {
    return serverError(error);
  }
}
