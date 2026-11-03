"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { getPasswordError, isValidEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

type SignupFormProps = {
  next: string;
  callbackFailed: boolean;
};

export function SignupForm({ next, callbackFailed }: SignupFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    callbackFailed
      ? "That verification link is invalid or has expired. Request a new email to continue."
      : null
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const passwordError = getPasswordError(password);

    if (!fullName.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);
    callbackUrl.searchParams.set("flow", "signup");

    const { error: signupError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    setIsSubmitting(false);

    if (signupError) {
      setError(
        "We could not create an account right now. Please try again shortly."
      );
      return;
    }

    setMessage(
      "If this email can be used for a FixFit account, check your inbox to verify your email and finish signing in."
    );
    toast.success("Check your email to verify your account.");
  }

  return (
    <div className="auth-card">
      <p className="section-eyebrow">Customer account</p>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-description">
        Verify your email to activate your FixFit account.
      </p>

      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="auth-error" id="signup-message" role="alert">
          {error}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="full-name">Full name</label>
        <input
          id="full-name"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={error ? "signup-message" : undefined}
          disabled={isSubmitting}
          required
        />
        <label htmlFor="new-password">Password</label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <button
          className="btn-primary auth-submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-note">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>.
      </p>
    </div>
  );
}
