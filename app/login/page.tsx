import type { Metadata } from "next";

import { getSafeRedirectPath } from "@/lib/auth/redirect";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your FixFit customer account with an email link.",
};

export default async function LoginPage({
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
        <LoginForm next={next} callbackFailed={query.error === "magic-link"} />
      </div>
    </main>
  );
}
