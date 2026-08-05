import { authenticateRequest } from '@/lib/supabase';
import { filterActivities } from '@/lib/db-queries';
import { ActivityWithRelations, ReportFilters } from '@/lib/types';
import { validateReportFilters } from '@/lib/validation';
import { jsonError, jsonOk, readJsonBody, serverError, unauthorized } from '@/lib/api-response';

function summarize(activities: ActivityWithRelations[]) {
  const totalMinutes = activities.reduce((sum, activity) => sum + activity.duration_minutes, 0);
  const rated = activities.filter((activity) => activity.rating > 0);
  const averageRating =
    rated.length === 0
      ? 0
      : rated.reduce((sum, activity) => sum + activity.rating, 0) / rated.length;
  return { total: activities.length, totalMinutes, averageRating };
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorized();
  const body = (await readJsonBody<ReportFilters>(request)) ?? {};
  const validationError = validateReportFilters(body);
  if (validationError) return jsonError(validationError, 400);
  try {
    const activities = await filterActivities(auth.client, auth.userId, body);
    return jsonOk({ activities, summary: summarize(activities) });
  } catch (error) {
    return serverError(error);
  }
}
