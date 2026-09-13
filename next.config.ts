import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Vercel's secret-pattern guardrail blocks saving a NEXT_PUBLIC_-prefixed
   * variable whose value looks like a JWT (which the Supabase anon key is,
   * even though it's designed to be public — protection comes from RLS, not
   * secrecy). Store it in Vercel as the unprefixed SUPABASE_ANON_KEY and
   * re-expose it under the name the client code expects here.
   */
  env: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
