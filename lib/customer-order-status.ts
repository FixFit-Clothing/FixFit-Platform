export type PaymentStatus =
  "awaiting_payment" | "submitted" | "verified" | "rejected" | null;

export function getOrderStatusLabel(orderStatus: string) {
  if (orderStatus === "confirmed") return "Confirmed";
  if (orderStatus === "cancelled") return "Cancelled";
  if (orderStatus === "draft") return "Draft";
  return "Pending";
}

export function getPaymentStatusLabel(paymentStatus: PaymentStatus) {
  if (paymentStatus === "awaiting_payment") return "Awaiting payment";
  if (paymentStatus === "submitted") return "Submitted for verification";
  if (paymentStatus === "verified") return "Verified";
  if (paymentStatus === "rejected") return "Needs attention";
  return "Not recorded for this existing booking";
}

export function getCustomerPaymentRejectionReason(reason: string | null) {
  if (!reason) return null;

  const customerMessage = reason.trim().replace(/\s+/g, " ");
  if (customerMessage.length < 5) return null;

  return customerMessage.slice(0, 280);
}

type CustomerOrderStatusInput = {
  orderStatus: string;
  paymentStatus: PaymentStatus;
  designExecutiveName: string | null;
  hasAssignedExecutive?: boolean;
};

export function getCustomerOrderStatus({
  orderStatus,
  paymentStatus,
  designExecutiveName,
  hasAssignedExecutive = false,
}: CustomerOrderStatusInput) {
  if (orderStatus === "cancelled") {
    return {
      label: "Booking cancelled",
      detail: "This booking is no longer active.",
      nextStep: null,
    };
  }

  if (paymentStatus === "verified" && orderStatus === "confirmed") {
    return {
      label: "Payment verified, booking confirmed",
      detail: "Your payment has been verified and your booking is confirmed.",
      nextStep: designExecutiveName
        ? `Your design executive has been assigned: ${designExecutiveName}`
        : hasAssignedExecutive
          ? "Your design executive has been assigned. Contact details will be shared when available."
          : "Your design executive is awaiting allocation.",
    };
  }

  if (paymentStatus === "rejected") {
    return {
      label: "Payment needs attention",
      detail:
        "We could not verify your payment. Please contact support for the next step.",
      nextStep: null,
    };
  }

  if (paymentStatus === "submitted") {
    return {
      label: "Payment submitted, awaiting verification",
      detail:
        "We have received your payment details. Our team will verify your transaction and update your booking. You do not need to place another order.",
      nextStep: "You can revisit this order page to see the latest update.",
    };
  }

  if (paymentStatus === "awaiting_payment") {
    return {
      label: "Initial booking payment required",
      detail:
        "Complete your initial booking payment to continue with this booking.",
      nextStep: "Use the payment section below after reviewing your order.",
    };
  }

  if (orderStatus === "confirmed") {
    return {
      label: "Booking confirmed",
      detail: "Your booking is confirmed.",
      nextStep: designExecutiveName
        ? `Your design executive has been assigned: ${designExecutiveName}`
        : hasAssignedExecutive
          ? "Your design executive has been assigned. Contact details will be shared when available."
          : "Your design executive is awaiting allocation.",
    };
  }

  return {
    label: "Booking created",
    detail:
      "We received your booking. Payment information is unavailable for this existing booking.",
    nextStep: "Please contact FixFit if you need help with the next step.",
  };
}
