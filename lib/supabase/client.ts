import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/env";

/** Creates a cookie-aware client for Client Components. */
export function createClient() {
  const {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  } = requireSupabaseEnv();

  return createBrowserClient(url, publishableKey);
}
