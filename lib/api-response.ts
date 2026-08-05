import { NextResponse } from 'next/server';

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized(): NextResponse {
  return jsonError('Unauthorized', 401);
}

export function notFound(resource: string): NextResponse {
  return jsonError(`${resource} not found`, 404);
}

export function serverError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return jsonError(message, 500);
}

export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
