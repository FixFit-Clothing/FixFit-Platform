import {
  garments,
  type IssueCategory,
  type ServiceTier,
} from "@/lib/estimator-data";
import {
  calculateEstimate,
  type EstimateSummary,
} from "@/lib/estimator-pricing";

export const BOOKING_DRAFT_STORAGE_KEY = "fixfit.booking-draft.v1";
export const BOOKING_DRAFT_VERSION = 1;
const BOOKING_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export type BookingDraftIssue = {
  category: IssueCategory;
  issue: string;
  options: string[];
};

export type BookingDraftCartItem = {
  id: string;
  garment: string;
  issues: BookingDraftIssue[];
  tier: ServiceTier;
  rush: boolean;
  // This is a browser-created preview data URL, not an uploaded file reference.
  photo: { previewUrl: string };
};

export type BookingOrderIssue = {
  issueId: string;
  optionIds: string[];
};

export type BookingOrderItem = {
  garmentTypeId: string;
  serviceTierCode: ServiceTier;
  rush: boolean;
  issues: BookingOrderIssue[];
};

export type BookingOrderSubmission = {
  idempotencyKey: string;
  addressId: string;
  paymentMethod: "upi";
  items: BookingOrderItem[];
};

export type BookingDraft = {
  version: typeof BOOKING_DRAFT_VERSION;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  cart: BookingDraftCartItem[];
  address: string;
  landmark: string;
  paymentMethod: "UPI" | "Card";
  // The customer-owned address selected during checkout, if one has been applied.
  addressId?: string;
  // Persisted before a submission attempt so retries use an identical request.
  orderSubmission?: BookingOrderSubmission;
  // Display-only browser estimate. The trusted booking workflow must recalculate it.
  estimate: EstimateSummary;
};

export type BookingDraftLoadResult =
  | { status: "ready"; draft: BookingDraft }
  | { status: "missing" | "expired" | "invalid" };

type BookingDraftInput = Omit<
  BookingDraft,
  "version" | "createdAt" | "updatedAt" | "expiresAt" | "estimate"
> & {
  estimate?: EstimateSummary;
};

type SaveBookingDraftOptions = {
  replacePendingSubmission?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTier(value: unknown): value is ServiceTier {
  return value === "spot" || value === "quick" || value === "schedule";
}

function isIssueCategory(value: unknown): value is IssueCategory {
  return (
    value === "alteration" || value === "replacement" || value === "enhancement"
  );
}

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUuid(value: unknown) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function isEstimateSummary(value: unknown): value is EstimateSummary {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.bookingFee) &&
    isFiniteNumber(value.rushFee) &&
    isFiniteNumber(value.rushCount) &&
    isTier(value.sharedTier) &&
    typeof value.turnaround === "string" &&
    isFiniteNumber(value.workFrom) &&
    isFiniteNumber(value.payNow)
  );
}

function isDraftCartItem(value: unknown): value is BookingDraftCartItem {
  if (!isRecord(value) || !isRecord(value.photo)) return false;

  return (
    isNonEmptyString(value.id) &&
    typeof value.garment === "string" &&
    (garments.includes(value.garment) || value.garment === "Other garment") &&
    Array.isArray(value.issues) &&
    value.issues.length > 0 &&
    value.issues.every(
      (issue) =>
        isRecord(issue) &&
        isIssueCategory(issue.category) &&
        isNonEmptyString(issue.issue) &&
        Array.isArray(issue.options) &&
        issue.options.every((option) => typeof option === "string")
    ) &&
    isTier(value.tier) &&
    typeof value.rush === "boolean" &&
    typeof value.photo.previewUrl === "string" &&
    value.photo.previewUrl.startsWith("data:image/")
  );
}

function isOrderSubmission(value: unknown): value is BookingOrderSubmission {
  if (!isRecord(value)) return false;

  return (
    isUuid(value.idempotencyKey) &&
    isUuid(value.addressId) &&
    value.paymentMethod === "upi" &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        isUuid(item.garmentTypeId) &&
        isTier(item.serviceTierCode) &&
        typeof item.rush === "boolean" &&
        Array.isArray(item.issues) &&
        item.issues.length > 0 &&
        item.issues.every(
          (issue) =>
            isRecord(issue) &&
            isUuid(issue.issueId) &&
            Array.isArray(issue.optionIds) &&
            issue.optionIds.every(isUuid)
        )
    )
  );
}

function isBookingDraft(value: unknown): value is BookingDraft {
  if (!isRecord(value)) return false;

  return (
    value.version === BOOKING_DRAFT_VERSION &&
    isFiniteNumber(value.createdAt) &&
    isFiniteNumber(value.updatedAt) &&
    isFiniteNumber(value.expiresAt) &&
    Array.isArray(value.cart) &&
    value.cart.length > 0 &&
    value.cart.every(isDraftCartItem) &&
    typeof value.address === "string" &&
    typeof value.landmark === "string" &&
    (value.paymentMethod === "UPI" || value.paymentMethod === "Card") &&
    (value.addressId === undefined || isUuid(value.addressId)) &&
    (value.orderSubmission === undefined ||
      isOrderSubmission(value.orderSubmission)) &&
    isEstimateSummary(value.estimate)
  );
}

export function createBookingDraft(input: BookingDraftInput): BookingDraft {
  const now = Date.now();

  return {
    ...input,
    version: BOOKING_DRAFT_VERSION,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + BOOKING_DRAFT_TTL_MS,
    estimate: input.estimate ?? calculateEstimate(input.cart),
  };
}

export function saveBookingDraft(
  draft: BookingDraft,
  options: SaveBookingDraftOptions = {}
) {
  if (typeof window === "undefined") {
    return {
      ok: false,
      error: "Booking drafts can only be saved in a browser.",
    };
  }

  try {
    const stored = window.localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (stored) {
      const existing: unknown = JSON.parse(stored);
      if (
        isBookingDraft(existing) &&
        existing.orderSubmission &&
        !options.replacePendingSubmission &&
        JSON.stringify(existing.orderSubmission) !==
          JSON.stringify(draft.orderSubmission)
      ) {
        return {
          ok: false,
          error:
            "A booking submission is still pending. Return to checkout to retry it or explicitly abandon it before changing this draft.",
        } as const;
      }
    }
    window.localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify(draft)
    );
    return { ok: true } as const;
  } catch {
    return {
      ok: false,
      error:
        "We could not save this booking draft on this device. Try a smaller photo before continuing.",
    } as const;
  }
}

export function loadBookingDraft(): BookingDraftLoadResult {
  if (typeof window === "undefined") return { status: "missing" };

  try {
    const stored = window.localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (!stored) return { status: "missing" };

    const parsed: unknown = JSON.parse(stored);
    if (!isBookingDraft(parsed)) return { status: "invalid" };
    // A submitted request may have reached the server even when the browser
    // never received its response. Keep its exact idempotency key and payload
    // available for a safe retry after the ordinary cart-draft window closes.
    if (parsed.expiresAt <= Date.now() && !parsed.orderSubmission) {
      return { status: "expired" };
    }

    return { status: "ready", draft: parsed };
  } catch {
    return { status: "invalid" };
  }
}

export function clearBookingDraft() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
  }
}

export function getCurrentEstimate(draft: BookingDraft) {
  // Catalog/pricing display data can change. Never treat the saved estimate as
  // authoritative for a future booking or payment transaction.
  return calculateEstimate(draft.cart);
}
