import type { Metadata } from "next";

import { getSafeRedirectPath } from "@/lib/auth/redirect";

import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your FixFit customer account.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const next = getSafeRedirectPath(
    typeof query.next === "string" ? query.next : undefined
  );

  return (
    <main className="auth-page">
      <div className="site-wrap auth-page-content">
        <SignupForm next={next} callbackFailed={query.error === "email-link"} />
      </div>
    </main>
  );
}
