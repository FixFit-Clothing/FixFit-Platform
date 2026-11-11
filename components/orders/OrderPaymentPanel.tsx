"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getCustomerPaymentRejectionReason,
  type PaymentStatus,
} from "@/lib/customer-order-status";

type OrderPaymentPanelProps = {
  orderId: string;
  orderReference: string;
  orderStatus: string;
  paymentStatus: PaymentStatus;
  paymentRejectionReason: string | null;
  initialAmountDue: number;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

export function OrderPaymentPanel({
  orderId,
  orderReference,
  orderStatus,
  paymentStatus,
  paymentRejectionReason,
  initialAmountDue,
}: OrderPaymentPanelProps) {
  const router = useRouter();
  const submissionLock = useRef(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customerRejectionReason = getCustomerPaymentRejectionReason(
    paymentRejectionReason
  );

  useEffect(() => {
    if (paymentStatus !== "submitted") return;

    const interval = window.setInterval(() => router.refresh(), 60_000);
    return () => window.clearInterval(interval);
  }, [paymentStatus, router]);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLock.current) return;

    submissionLock.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/customer/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentReference }),
      });
      const body: unknown = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/account/orders/${orderId}`)}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          getResponseError(body) ??
            "We could not submit payment details. Please try again."
        );
      }

      toast.success("Payment details submitted for verification.");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit payment details. Please try again."
      );
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  if (orderStatus === "cancelled") {
    return (
      <section className="order-payment-panel" aria-labelledby="payment-title">
        <h2 id="payment-title">Payment information</h2>
        <p>
          This booking has been cancelled. Payment submission is unavailable.
        </p>
      </section>
    );
  }

  if (paymentStatus === null) {
    return (
      <section className="order-payment-panel" aria-labelledby="payment-title">
        <h2 id="payment-title">Payment information</h2>
        <p>
          Payment information is unavailable for this existing booking. Contact
          FixFit if you need help.
        </p>
      </section>
    );
  }

  if (paymentStatus === "submitted") {
    return (
      <section className="order-payment-panel" aria-labelledby="payment-title">
        <p className="section-eyebrow">Payment submitted</p>
        <h2 id="payment-title">
          Payment submitted — awaiting admin verification
        </h2>
        <p>
          We have received your payment details. Our team will verify your
          transaction and update your booking. You do not need to place another
          order.
        </p>
        <p className="payment-refresh-note" role="status">
          This page checks for an update every minute while it remains open.
        </p>
      </section>
    );
  }

  if (paymentStatus === "verified") {
    return (
      <section className="order-payment-panel" aria-labelledby="payment-title">
        <p className="section-eyebrow">Payment verified</p>
        <h2 id="payment-title">Payment verified. Your booking is confirmed.</h2>
        <p>
          Your payment has been verified. No further payment action is needed.
        </p>
      </section>
    );
  }

  if (paymentStatus === "rejected") {
    return (
      <section className="order-payment-panel" aria-labelledby="payment-title">
        <p className="section-eyebrow">Payment needs attention</p>
        <h2 id="payment-title">We could not verify your payment.</h2>
        <p>
          Please contact FixFit for the next step. Do not create another order.
        </p>
        {customerRejectionReason ? (
          <p className="payment-rejection-reason">
            <strong>Reason:</strong> {customerRejectionReason}
          </p>
        ) : null}
      </section>
    );
  }

  if (orderStatus !== "pending") {
    return (
      <section className="order-payment-panel" aria-labelledby="payment-title">
        <h2 id="payment-title">Payment information</h2>
        <p>This booking is not currently eligible for payment submission.</p>
      </section>
    );
  }

  return (
    <section className="order-payment-panel" aria-labelledby="payment-title">
      <p className="section-eyebrow">Initial booking payment</p>
      <h2 id="payment-title">Complete your initial booking payment.</h2>
      <p>
        Pay <strong>{formatMoney(initialAmountDue)}</strong> for booking{" "}
        <strong>{orderReference}</strong>. This amount includes the booking fee
        and any qualifying rush fees only; estimated garment-work charges are
        assessed later.
      </p>

      <figure className="payment-qr">
        {/* The supplied business QR asset is intentionally served unchanged. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="FixFit PhonePe UPI payment QR code"
          src="/images/phonepe-qr.jpeg"
        />
        <figcaption>
          Scan with any supported UPI app. Verify the recipient name in your
          payment app before paying.
        </figcaption>
      </figure>

      <form
        className="auth-form payment-submission-form"
        onSubmit={submitPayment}
        noValidate
      >
        <label htmlFor="payment-reference">
          UPI transaction reference / UTR
        </label>
        <input
          id="payment-reference"
          autoComplete="off"
          disabled={isSubmitting}
          maxLength={128}
          onChange={(event) => setPaymentReference(event.target.value)}
          placeholder="Enter the reference from your UPI app"
          required
          value={paymentReference}
        />
        <small>
          FixFit manually verifies submitted payment details. Submitting this
          reference does not confirm your booking immediately.
        </small>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="estimator-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Submitting payment details…"
            : "I’ve made the payment"}
        </button>
      </form>
    </section>
  );
}
