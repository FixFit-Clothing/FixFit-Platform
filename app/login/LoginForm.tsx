"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type LoginFormProps = {
  next: string;
  callbackFailed: boolean;
};

export function LoginForm({ next, callbackFailed }: LoginFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
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

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
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
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMagicLink();
  }

  return (
    <div className="auth-card">
      <p className="section-eyebrow">Customer account</p>
      <h1 className="auth-title">Sign in to FixFit</h1>
      <p className="auth-description">
        We’ll email you a secure sign-in link. No password needed.
      </p>

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
        <button
          className="btn-primary auth-submit"
          type="submit"
          disabled={isSubmitting || cooldown > 0}
        >
          {isSubmitting
            ? "Sending link…"
            : cooldown > 0
              ? `Request another link in ${cooldown}s`
              : "Email me a sign-in link"}
        </button>
      </form>

      <p className="auth-note">
        Your phone number is optional for sign-in and will be requested before
        booking.
      </p>
    </div>
  );
}
