// lib/supabase.ts throws at import time when these are unset. Tests never reach a
// real Supabase instance (the client is mocked), so fake values are enough.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';
