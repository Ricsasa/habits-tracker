import { apiRequest, authHeaders } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

const getSession = supabase.auth.getSession as jest.Mock;

function mockSession(accessToken: string | null) {
  getSession.mockResolvedValue({
    data: { session: accessToken ? { access_token: accessToken } : null },
  });
}

function mockFetchResponse(body: unknown, init: { ok?: boolean; json?: () => Promise<unknown> } = {}) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: init.ok ?? true,
    json: init.json ?? (async () => body),
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSession('token-abc');
});

describe('authHeaders', () => {
  it('adds a Bearer token when a session exists', async () => {
    await expect(authHeaders()).resolves.toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-abc',
    });
  });

  it('omits Authorization when there is no session, keeping Content-Type', async () => {
    mockSession(null);
    await expect(authHeaders()).resolves.toEqual({ 'Content-Type': 'application/json' });
  });
});

describe('apiRequest', () => {
  it('sends no body when none is given and stringifies it otherwise', async () => {
    const fetchMock = mockFetchResponse({ activities: [] });

    await apiRequest('/api/activities', 'GET');
    expect(fetchMock).toHaveBeenCalledWith('/api/activities', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-abc' },
      body: undefined,
    });

    await apiRequest('/api/activities', 'POST', { title: 'Standup' });
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/activities',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ title: 'Standup' }) })
    );
  });

  it('throws the server error message on a non-ok response', async () => {
    mockFetchResponse({ error: 'title cannot be empty' }, { ok: false });
    await expect(apiRequest('/api/activities', 'POST', {})).rejects.toThrow(
      'title cannot be empty'
    );
  });

  it('falls back to request_failed when the error body cannot be parsed', async () => {
    mockFetchResponse(null, {
      ok: false,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    });
    await expect(apiRequest('/api/activities', 'GET')).rejects.toThrow('request_failed');
  });
});
