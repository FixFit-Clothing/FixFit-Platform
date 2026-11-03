import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PasswordSetupForm } from "@/components/auth/PasswordSetupForm";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set password",
  description: "Set a password for your FixFit account.",
};

export default async function PasswordSetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [query, supabase] = await Promise.all([searchParams, createClient()]);
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login?next=%2Fpassword%2Fsetup");
  }

  const next = getSafeRedirectPath(
    typeof query.next === "string" ? query.next : undefined
  );

  return (
    <main className="auth-page">
      <div className="site-wrap auth-page-content">
        <PasswordSetupForm
          next={next}
          recoveryReady={query.recovery === "ready"}
        />
      </div>
    </main>
  );
}
