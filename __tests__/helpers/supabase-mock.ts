import { SupabaseClient } from '@supabase/supabase-js';

export interface UpsertCall {
  table: string;
  rows: Record<string, unknown>[];
  options?: { onConflict?: string; ignoreDuplicates?: boolean };
}

export interface SupabaseMockConfig {
  /**
   * Rows returned by successive selects on a table. Each select shifts one entry
   * off the queue; once a single entry is left it is returned for every further
   * read. Bootstrap re-reads categories and tags after writing them, so those
   * tables need a before/after pair.
   */
  selects?: Record<string, unknown[][]>;
  /** Error surfaced by a select on this table, instead of rows. */
  selectErrors?: Record<string, Error>;
  /** Error surfaced by an upsert on this table. */
  upsertErrors?: Record<string, Error>;
}

export interface SupabaseMock {
  client: SupabaseClient;
  upserts: UpsertCall[];
  selectCounts: Record<string, number>;
  upsertsFor(table: string): UpsertCall[];
}

type QueryResult = { data: unknown[] | null; error: Error | null };

/**
 * Minimal stand-in for the Supabase query builder: every filter method returns
 * the same object, and the object is awaitable at any point in the chain, which
 * is how the real builder behaves for the calls this app makes.
 */
function createBuilder(resolve: () => QueryResult, onUpsert: (call: Omit<UpsertCall, 'table'>) => QueryResult) {
  const builder: Record<string, unknown> = {};
  let pending: QueryResult | null = null;

  const chain = () => builder;
  for (const method of ['select', 'eq', 'in', 'gte', 'lte', 'order', 'limit', 'single', 'delete']) {
    builder[method] = jest.fn(chain);
  }
  for (const method of ['insert', 'update']) {
    builder[method] = jest.fn(chain);
  }
  builder.upsert = jest.fn((rows: Record<string, unknown>[], options?: UpsertCall['options']) => {
    pending = onUpsert({ rows: Array.isArray(rows) ? rows : [rows], options });
    return builder;
  });
  builder.then = (onFulfilled: (value: QueryResult) => unknown, onRejected?: (reason: unknown) => unknown) => {
    const result = pending ?? resolve();
    pending = null;
    return Promise.resolve(result).then(onFulfilled, onRejected);
  };

  return builder;
}

export function createSupabaseMock(config: SupabaseMockConfig = {}): SupabaseMock {
  const queues: Record<string, unknown[][]> = {};
  for (const [table, results] of Object.entries(config.selects ?? {})) {
    queues[table] = results.map((rows) => [...rows]);
  }

  const upserts: UpsertCall[] = [];
  const selectCounts: Record<string, number> = {};

  const from = jest.fn((table: string) =>
    createBuilder(
      () => {
        selectCounts[table] = (selectCounts[table] ?? 0) + 1;
        const selectError = config.selectErrors?.[table];
        if (selectError) return { data: null, error: selectError };
        const queue = queues[table] ?? [[]];
        const rows = queue.length > 1 ? (queue.shift() as unknown[]) : queue[0];
        return { data: rows ?? [], error: null };
      },
      ({ rows, options }) => {
        upserts.push({ table, rows, options });
        const upsertError = config.upsertErrors?.[table];
        return { data: null, error: upsertError ?? null };
      }
    )
  );

  return {
    client: { from } as unknown as SupabaseClient,
    upserts,
    selectCounts,
    upsertsFor: (table: string) => upserts.filter((call) => call.table === table),
  };
}
