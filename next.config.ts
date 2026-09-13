import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Vercel's guardrail blocks saving env vars named with a NEXT_PUBLIC_
   * prefix (it reads "PUBLIC" as a signal a secret-shaped value is being
   * exposed) — this hits both the Supabase URL and anon key, even though
   * both are meant to be public (protection comes from RLS, not secrecy).
   * Store them in Vercel under plain, unprefixed names and re-expose them
   * under the NEXT_PUBLIC_ names the client code expects here.
   */
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
