"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Returns a real Supabase client in the browser, and a no-op stub during SSR
// (or when env vars aren't configured yet) so build-time prerendering of
// "use client" pages doesn't throw.
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof window === "undefined" || !url || !key) {
    return stubClient();
  }
  return createBrowserClient(url, key);
}

function stubClient(): SupabaseClient {
  const noop = async () => ({ data: null, error: null });
  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: noop,
    upsert: noop,
    update: noop,
    delete: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: noop,
    single: noop,
    then: (res: (v: { data: null; error: null }) => unknown) =>
      Promise.resolve({ data: null, error: null }).then(res),
  };
  const fakeClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOtp: async () => ({ data: null, error: null }),
      exchangeCodeForSession: async () => ({ data: null, error: null }),
    },
    from: () => chain,
    rpc: noop,
  };
  return fakeClient as unknown as SupabaseClient;
}
