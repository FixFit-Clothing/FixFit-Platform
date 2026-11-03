"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { isValidEmail } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

type LoginFormProps = {
  next: string;
  callbackFailed: boolean;
};

export function LoginForm({ next, callbackFailed }: LoginFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    callbackFailed
      ? "That sign-in link is invalid or has expired. Request a new link to continue."
      : null
  );

  useEffect(() => {
    if (cooldown === 0) return;

    const interval = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cooldown]);

  async function sendMagicLink() {
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
    callbackUrl.searchParams.set("flow", "magic");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        // New customers should use the verified password signup flow. Keep
        // this fallback for existing passwordless accounts without creating
        // another account unexpectedly.
        shouldCreateUser: false,
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    setIsSubmitting(false);

    if (otpError) {
      // Keep the response generic so this flow does not reveal account state.
      setError(
        "We could not send a sign-in link right now. Please try again shortly."
      );
      return;
    }

    setEmail(normalizedEmail);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setMessage(
      "If this email can receive a sign-in link, check your inbox and open it in this browser."
    );
    toast.success("Check your email for a secure sign-in link.");
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setIsSubmitting(false);

    if (passwordError) {
      setError(
        "Your email or password is incorrect. Try again or reset your password."
      );
      return;
    }

    // A full navigation ensures the server-rendered navigation and protected
    // pages read the newly persisted cookie-backed session.
    window.location.assign(next);
  }

  return (
    <div className="auth-card">
      <p className="section-eyebrow">Customer account</p>
      <h1 className="auth-title">Sign in to FixFit</h1>
      <p className="auth-description">Sign in with your email and password.</p>

      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="auth-error" id="login-message" role="alert">
          {error}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={error ? "login-message" : undefined}
          disabled={isSubmitting}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <button
          className="btn-primary auth-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="auth-actions">
        <Link href={`/forgot-password?next=${encodeURIComponent(next)}`}>
          Set up or reset password
        </Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`}>
          Create an account
        </Link>
      </div>
      <div className="auth-divider" aria-hidden="true">
        <span>or</span>
      </div>
      <button
        className="auth-text-button"
        disabled={isSubmitting || cooldown > 0}
        onClick={() => void sendMagicLink()}
        type="button"
      >
        {cooldown > 0
          ? `Request another sign-in link in ${cooldown}s`
          : "Email me a magic sign-in link"}
      </button>
      <p className="auth-note">
        Existing passwordless customers can use a magic link or set a password
        using the secure reset flow.
      </p>
    </div>
  );
}
