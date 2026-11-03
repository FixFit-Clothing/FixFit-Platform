import type { Metadata } from "next";

import { getSafeRedirectPath } from "@/lib/auth/redirect";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Set up or reset password",
  description: "Set up or reset your FixFit account password.",
};

export default async function ForgotPasswordPage({
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
        <ForgotPasswordForm
          next={next}
          callbackFailed={query.error === "email-link"}
        />
      </div>
    </main>
  );
}
