import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Per-request memoized auth.getUser(). Every layout and page in the (app)
 * tree calls this to get the authenticated user - without the cache, each
 * one triggers its own network round-trip to Supabase Auth, and a single
 * navigation renders the layout plus a page, doubling the wait for no
 * reason. React's cache() collapses repeated calls within the same request
 * into one, since Next.js re-runs Server Components (and this module-level
 * cache) fresh per request rather than sharing state across requests.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
