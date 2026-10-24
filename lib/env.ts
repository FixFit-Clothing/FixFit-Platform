import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type SupabaseEnv = z.infer<typeof envSchema>;

export function getSupabaseEnv(): SupabaseEnv | null {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  return result.success ? result.data : null;
}

export function requireSupabaseEnv(): SupabaseEnv {
  const config = getSupabaseEnv();

  if (!config) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return config;
}
