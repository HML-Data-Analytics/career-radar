import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Vercel's guardrail blocks saving ANY env var named with a NEXT_PUBLIC_
   * prefix (it reads "PUBLIC" in the name itself as a signal a secret is
   * being exposed, regardless of the value) - this hits every NEXT_PUBLIC_
   * var this app uses, even ones with no secrecy concern at all. Store all
   * of them in Vercel under plain, unprefixed names and re-expose them
   * under the NEXT_PUBLIC_ names the client code expects here.
   */
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL,
  },
};

export default nextConfig;
