"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { isValidEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

type ForgotPasswordFormProps = {
  next: string;
  callbackFailed: boolean;
};

export function ForgotPasswordForm({
  next,
  callbackFailed,
}: ForgotPasswordFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    callbackFailed
      ? "That password link is invalid or has expired. Request a new link to continue."
      : null
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);
    callbackUrl.searchParams.set("flow", "recovery");

    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo: callbackUrl.toString() }
    );

    setIsSubmitting(false);

    if (recoveryError) {
      setError(
        "We could not send a password link right now. Please try again shortly."
      );
      return;
    }

    setMessage(
      "If this email can receive a FixFit password link, check your inbox and open it in this browser."
    );
    toast.success("Check your email for a secure password link.");
  }

  return (
    <div className="auth-card">
      <p className="section-eyebrow">Account access</p>
      <h1 className="auth-title">Set up your password</h1>
      <p className="auth-description">
        Use this for a forgotten password or to add a password to an existing
        magic-link account.
      </p>

      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="auth-error" id="recovery-message" role="alert">
          {error}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={error ? "recovery-message" : undefined}
          disabled={isSubmitting}
          required
        />
        <button
          className="btn-primary auth-submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Sending link…" : "Email me a secure password link"}
        </button>
      </form>

      <p className="auth-note">
        Remembered your password?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>.
      </p>
    </div>
  );
}
