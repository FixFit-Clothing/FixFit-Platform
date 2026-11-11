"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CheckoutCustomerDetails } from "@/components/checkout/CheckoutCustomerDetails";

import {
  clearBookingDraft,
  getCurrentEstimate,
  loadBookingDraft,
  saveBookingDraft,
  type BookingDraft,
  type BookingDraftCartItem,
  type BookingOrderSubmission,
} from "@/lib/booking-draft";
import {
  CheckoutOrderSubmissionError,
  resolveOrderItems,
} from "@/lib/checkout-order-submission";
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

type CreatedOrderResponse = {
  order: {
    id: string;
    reference: string;
    status: string;
    createdAt: string;
    estimatedWorkAmount: number;
    bookingFeeAmount: number;
    rushFeeAmount: number;
    finalPayableAmount: number | null;
  };
};

function getResponseError(body: unknown) {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return null;
}

function isCreatedOrderResponse(value: unknown): value is CreatedOrderResponse {
  if (typeof value !== "object" || value === null || !("order" in value)) {
    return false;
  }
  const order = value.order;
  return (
    typeof order === "object" &&
    order !== null &&
    "id" in order &&
    typeof order.id === "string" &&
    "reference" in order &&
    typeof order.reference === "string" &&
    "status" in order &&
    typeof order.status === "string" &&
    "estimatedWorkAmount" in order &&
    typeof order.estimatedWorkAmount === "number" &&
    "bookingFeeAmount" in order &&
    typeof order.bookingFeeAmount === "number" &&
    "rushFeeAmount" in order &&
    typeof order.rushFeeAmount === "number"
  );
}

export function CheckoutConfirmation({
  loginSucceeded,
}: CheckoutConfirmationProps) {
  const router = useRouter();
  const didHandleLoginSuccess = useRef(false);
  const submissionLock = useRef(false);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [status, setStatus] = useState<
    "loading" | "missing" | "expired" | "invalid"
  >("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

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

  function updateDraft(
    nextDraft: BookingDraft,
    options: { invalidatePendingSubmission?: boolean } = {}
  ) {
    const invalidatePendingSubmission =
      options.invalidatePendingSubmission ??
      draft?.addressId !== nextDraft.addressId;
    const updatedDraft: BookingDraft = {
      ...nextDraft,
      orderSubmission: invalidatePendingSubmission
        ? undefined
        : draft?.orderSubmission,
    };
    const saved = saveBookingDraft(updatedDraft, {
      replacePendingSubmission: invalidatePendingSubmission,
    });
    if (!saved.ok) {
      setSubmissionError(saved.error);
      return false;
    }
    setSubmissionError(null);
    setDraft(updatedDraft);
    return true;
  }

  function abandonPendingSubmission() {
    if (!draft?.orderSubmission) return;

    const confirmed = window.confirm(
      "Abandon this pending booking submission? The server may already have created the order. Check My Account before starting over. This will discard the saved draft and its retry key."
    );
    if (!confirmed) return;

    clearBookingDraft();
    setDraft(null);
    setStatus("missing");
    setSubmissionError(null);
  }

  async function submitBooking() {
    if (!draft || submissionLock.current) return;

    submissionLock.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      if (draft.paymentMethod !== "UPI") {
        throw new CheckoutOrderSubmissionError(
          "UPI is the only available payment method for this booking. Edit your booking to select UPI."
        );
      }
      if (!draft.addressId) {
        throw new CheckoutOrderSubmissionError(
          "Choose a saved pickup address and use it for this booking before submitting."
        );
      }

      let submission: BookingOrderSubmission | undefined =
        draft.orderSubmission;

      if (!submission) {
        submission = {
          idempotencyKey: crypto.randomUUID(),
          addressId: draft.addressId,
          paymentMethod: "upi",
          items: await resolveOrderItems(draft.cart),
        };
        const draftForRetry: BookingDraft = {
          ...draft,
          orderSubmission: submission,
        };
        const saved = saveBookingDraft(draftForRetry);
        if (!saved.ok) {
          throw new CheckoutOrderSubmissionError(saved.error);
        }
        setDraft(draftForRetry);
      }

      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const body: unknown = await response.json().catch(() => null);

      if (response.status === 401) {
        toast.error(
          "Your session has expired. Sign in to continue your booking."
        );
        router.push("/login?next=%2Fcheckout%2Fconfirm");
        return;
      }
      if (!response.ok) {
        throw new CheckoutOrderSubmissionError(
          getResponseError(body) ??
            "We could not create your booking. Please try again."
        );
      }
      if (!isCreatedOrderResponse(body)) {
        throw new CheckoutOrderSubmissionError(
          "We could not confirm your booking. Please try again."
        );
      }

      clearBookingDraft();
      toast.success(`Booking ${body.order.reference} created.`);
      router.push(`/account/orders/${encodeURIComponent(body.order.id)}`);
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not create your booking. Please try again."
      );
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
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
            {draft.orderSubmission
              ? "Your booking request is pending confirmation. Retrying uses the same saved request."
              : "Review your booking details. Payment is not requested until after an order is created."}
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
              <span>Initial amount due after booking is created</span>
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

          <CheckoutCustomerDetails draft={draft} onDraftUpdated={updateDraft} />

          {draft.orderSubmission ? (
            <p className="checkout-phone-gate" role="status">
              A booking submission is waiting to be confirmed. Retrying uses the
              same saved details and submission key.
            </p>
          ) : null}

          {submissionError ? (
            <p className="auth-error" role="alert">
              {submissionError}
            </p>
          ) : null}

          <div className="checkout-actions">
            <button
              className="estimator-primary"
              disabled={isSubmitting}
              onClick={() => void submitBooking()}
              type="button"
            >
              {isSubmitting ? "Creating booking…" : "Create booking"}
            </button>
            {draft.orderSubmission ? (
              <button
                className="estimator-secondary"
                onClick={abandonPendingSubmission}
                type="button"
              >
                Abandon pending submission and discard draft
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
