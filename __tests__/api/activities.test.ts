/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/activities/route';
import { authenticateRequest } from '@/lib/supabase';
import { createActivity, listActivities } from '@/lib/db-server';
import { createSupabaseMock } from '../helpers/supabase-mock';
import {
  TEST_USER_ID,
  makeActivity,
  makeActivityInput,
  makeActivityWithRelations,
} from '../helpers/fixtures';
import { jsonRequest, malformedRequest } from '../helpers/request';

jest.mock('@/lib/supabase', () => ({ authenticateRequest: jest.fn() }));
jest.mock('@/lib/db-server', () => ({
  listActivities: jest.fn(),
  createActivity: jest.fn(),
}));

const authenticateRequestMock = authenticateRequest as jest.Mock;
const listActivitiesMock = listActivities as jest.Mock;
const createActivityMock = createActivity as jest.Mock;
const client = createSupabaseMock().client;

beforeEach(() => {
  jest.clearAllMocks();
  authenticateRequestMock.mockResolvedValue({ client, userId: TEST_USER_ID });
});

describe('GET /api/activities', () => {
  it('returns 401 without a valid auth context', async () => {
    authenticateRequestMock.mockResolvedValue(null);

    const response = await GET(jsonRequest('/api/activities', 'GET'));

    expect(response.status).toBe(401);
    expect(listActivitiesMock).not.toHaveBeenCalled();
  });

  it('forwards the date search param, and undefined when it is absent', async () => {
    listActivitiesMock.mockResolvedValue([makeActivityWithRelations()]);

    const scoped = await GET(jsonRequest('/api/activities?date=2026-08-04', 'GET'));

    expect(scoped.status).toBe(200);
    expect(await scoped.json()).toEqual({ activities: [makeActivityWithRelations()] });
    expect(listActivitiesMock).toHaveBeenCalledWith(client, TEST_USER_ID, '2026-08-04');

    await GET(jsonRequest('/api/activities', 'GET'));
    expect(listActivitiesMock).toHaveBeenLastCalledWith(client, TEST_USER_ID, undefined);
  });

  it('keeps the underlying message out of the 500 body and logs it instead', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    listActivitiesMock.mockRejectedValue(new Error('connection terminated'));

    const response = await GET(jsonRequest('/api/activities', 'GET'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal server error');
    expect(body.reference).toEqual(expect.any(String));
    expect(errorSpy.mock.calls[0][0]).toContain('connection terminated');
    expect(errorSpy.mock.calls[0][0]).toContain(body.reference);
    errorSpy.mockRestore();
  });

  it('rejects a date query param that is not an ISO date', async () => {
    const response = await GET(jsonRequest('/api/activities?date=not-a-date', 'GET'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'date must be YYYY-MM-DD' });
    expect(listActivitiesMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/activities', () => {
  it('returns 400 when the body is not valid JSON', async () => {
    const response = await POST(malformedRequest('/api/activities', 'POST'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON body' });
    expect(createActivityMock).not.toHaveBeenCalled();
  });

  it('returns 400 with the validation message and never touches the database', async () => {
    const response = await POST(
      jsonRequest('/api/activities', 'POST', makeActivityInput({ category_id: '' }))
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'category_id is required' });
    expect(createActivityMock).not.toHaveBeenCalled();
  });

  it('returns 201 with the created activity for a valid payload', async () => {
    const input = makeActivityInput();
    const activity = makeActivity();
    createActivityMock.mockResolvedValue(activity);

    const response = await POST(jsonRequest('/api/activities', 'POST', input));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ activity });
    expect(createActivityMock).toHaveBeenCalledWith(client, TEST_USER_ID, input);
  });
});
