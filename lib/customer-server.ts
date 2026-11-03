import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AuthenticatedCustomer = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string;
  fullName: string | null;
};

export async function getAuthenticatedCustomer() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) return null;

  const metadata =
    typeof claims.user_metadata === "object" && claims.user_metadata !== null
      ? claims.user_metadata
      : null;
  const fullName =
    metadata && typeof metadata.full_name === "string"
      ? metadata.full_name.trim().slice(0, 120) || null
      : null;

  return {
    supabase,
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    fullName,
  };
}

export async function ensureCustomerProfile(customer: AuthenticatedCustomer) {
  const existing = await customer.supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", customer.userId)
    .maybeSingle();

  if (existing.data) return existing;
  if (existing.error) return existing;

  const created = await customer.supabase
    .from("profiles")
    .insert({ id: customer.userId, full_name: customer.fullName })
    .select("full_name, phone")
    .single();

  if (!created.error) return created;

  // A separate request may have created the row after the initial read.
  return customer.supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", customer.userId)
    .single();
}
