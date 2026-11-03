"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { getPasswordError } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

type PasswordSetupFormProps = {
  next: string;
  recoveryReady: boolean;
};

export function PasswordSetupForm({
  next,
  recoveryReady,
}: PasswordSetupFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordError = getPasswordError(password);

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

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (updateError) {
      setError(
        "We could not update your password. Request a new secure link and try again."
      );
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setSuccess(true);
    toast.success("Your password has been updated.");
  }

  return (
    <div className="auth-card">
      <p className="section-eyebrow">Account access</p>
      <h1 className="auth-title">Choose a new password</h1>
      <p className="auth-description">
        {recoveryReady
          ? "Your secure recovery link has been verified."
          : "Set a secure password for your FixFit account."}
      </p>

      {success ? (
        <div className="auth-message" role="status">
          <p>Your password is ready to use.</p>
          <Link className="auth-text-button" href={next}>
            Continue
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={error ? "password-message" : undefined}
            disabled={isSubmitting}
            required
          />
          <label htmlFor="confirm-password">Confirm new password</label>
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
          {error ? (
            <p className="auth-error" id="password-message" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="btn-primary auth-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving password…" : "Save password"}
          </button>
        </form>
      )}
    </div>
  );
}
