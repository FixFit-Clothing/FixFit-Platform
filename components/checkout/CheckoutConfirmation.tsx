"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  clearBookingDraft,
  getCurrentEstimate,
  loadBookingDraft,
  type BookingDraft,
  type BookingDraftCartItem,
} from "@/lib/booking-draft";
import { tiers } from "@/lib/estimator-data";

function issueLabel(item: BookingDraftCartItem) {
  return item.issues
    .map((issue) =>
      issue.options.length
        ? `${issue.issue} → ${issue.options.join(", ")}`
        : issue.issue
    )
    .join(" · ");
}

type CheckoutConfirmationProps = {
  loginSucceeded: boolean;
};

export function CheckoutConfirmation({
  loginSucceeded,
}: CheckoutConfirmationProps) {
  const router = useRouter();
  const didHandleLoginSuccess = useRef(false);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [status, setStatus] = useState<
    "loading" | "missing" | "expired" | "invalid"
  >("loading");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const result = loadBookingDraft();

      if (result.status === "ready") {
        setDraft(result.draft);
        return;
      }

      setStatus(result.status);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loginSucceeded || didHandleLoginSuccess.current) return;

    didHandleLoginSuccess.current = true;
    toast.success("Login successful. Continue with your booking.");
    router.replace("/checkout/confirm");
  }, [loginSucceeded, router]);

  function discardDraft() {
    clearBookingDraft();
    setDraft(null);
    setStatus("missing");
  }

  if (!draft) {
    const message =
      status === "loading"
        ? "Restoring your booking draft…"
        : status === "expired"
          ? "This saved booking draft has expired."
          : status === "invalid"
            ? "We could not read the saved booking draft on this device."
            : "There is no saved booking draft to confirm.";

    return (
      <main className="checkout-page">
        <section className="site-wrap checkout-shell">
          <div className="checkout-card checkout-empty">
            <p className="section-eyebrow">Booking draft</p>
            <h1 className="section-title">Return to your estimator</h1>
            <p>{message}</p>
            <div className="checkout-actions">
              <Link className="estimator-primary" href="/estimator">
                Go to estimator
              </Link>
              {status === "expired" || status === "invalid" ? (
                <button
                  className="estimator-secondary"
                  onClick={discardDraft}
                  type="button"
                >
                  Discard saved draft
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    );
  }

  const estimate = getCurrentEstimate(draft);

  return (
    <main className="checkout-page">
      <section
        className="site-wrap checkout-shell"
        aria-labelledby="checkout-title"
      >
        <header className="section-head checkout-header">
          <p className="section-eyebrow">Booking draft</p>
          <h1 className="section-title" id="checkout-title">
            Review your visit
          </h1>
          <p>
            Your details are saved on this device. No booking or payment has
            been created yet.
          </p>
        </header>

        <div className="checkout-card">
          <h2>
            Your visit — {draft.cart.length} garment
            {draft.cart.length === 1 ? "" : "s"}
          </h2>
          <div className="estimator-cart">
            {draft.cart.map((item) => (
              <div className="estimator-cart-item" key={item.id}>
                {/* Saved previews are local browser data URLs, not uploaded images. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`Photo of ${item.garment}`}
                  className="estimator-cart-photo"
                  src={item.photo.previewUrl}
                />
                <div>
                  <strong>{item.garment}</strong>
                  <p>{issueLabel(item)}</p>
                  <small>
                    {tiers[item.tier].label} · {tiers[item.tier].turnaround}
                    {item.rush ? " · Rush selected" : ""}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="estimator-summary">
            <p>
              <span>Shared visit turnaround</span>
              <strong>
                {tiers[estimate.sharedTier].label} · {estimate.turnaround}
              </strong>
            </p>
            <p>
              <span>Work estimate</span>
              <strong>From ₹{estimate.workFrom}</strong>
            </p>
            <p>
              <span>Booking fee (adjusted against final bill)</span>
              <strong>₹{estimate.bookingFee}</strong>
            </p>
            {estimate.rushFee > 0 ? (
              <p>
                <span>Rush upgrades</span>
                <strong>₹{estimate.rushFee}</strong>
              </p>
            ) : null}
            <p className="total">
              <span>Pay now via {draft.paymentMethod}</span>
              <strong>₹{estimate.payNow}</strong>
            </p>
          </div>

          <dl className="checkout-details">
            <div>
              <dt>Pickup address</dt>
              <dd>{draft.address}</dd>
            </div>
            {draft.landmark ? (
              <div>
                <dt>Landmark</dt>
                <dd>{draft.landmark}</dd>
              </div>
            ) : null}
          </dl>

          <div className="checkout-actions">
            <Link className="estimator-primary" href="/estimator">
              Edit booking details
            </Link>
            <button
              className="estimator-secondary"
              onClick={discardDraft}
              type="button"
            >
              Discard saved draft
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
