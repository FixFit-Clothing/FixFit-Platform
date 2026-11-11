import { NextResponse } from "next/server";
import { z } from "zod";

import {
  submitUpiPaymentSchema,
  type SubmittedUpiPayment,
} from "@/lib/payment-submission";
import { getAuthenticatedCustomer } from "@/lib/customer-server";

export const dynamic = "force-dynamic";

const orderIdSchema = z.uuid();

type RpcPaymentRow = {
  order_id: string;
  order_reference: string;
  payment_status: "submitted";
  payment_submitted_at: string;
};

function safeError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function logPaymentError(error: {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  console.error("[customer-order-payment] Supabase RPC failed", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const customer = await getAuthenticatedCustomer();
  if (!customer) {
    return safeError("Sign in to submit payment details.", 401);
  }

  const { orderId } = await params;
  if (!orderIdSchema.safeParse(orderId).success) {
    return safeError("Invalid booking.", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return safeError("Enter a valid UPI transaction reference.", 400);
  }

  const parsed = submitUpiPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return safeError("Enter a valid UPI transaction reference.", 400);
  }

  const { data, error } = await customer.supabase.rpc(
    "fixfit_submit_customer_upi_payment",
    {
      p_order_id: orderId,
      p_payment_reference: parsed.data.paymentReference,
    }
  );

  if (error) {
    logPaymentError(error);
    if (error.code === "P0001") {
      return safeError(
        error.message || "We could not submit payment details.",
        409
      );
    }
    return safeError("We could not submit payment details right now.", 500);
  }

  const row = Array.isArray(data)
    ? (data[0] as RpcPaymentRow | undefined)
    : undefined;
  if (!row) {
    console.error("[customer-order-payment] RPC returned no payment row");
    return safeError("We could not submit payment details right now.", 500);
  }

  const payment: SubmittedUpiPayment = {
    orderId: row.order_id,
    orderReference: row.order_reference,
    paymentStatus: row.payment_status,
    paymentSubmittedAt: row.payment_submitted_at,
  };

  return NextResponse.json({ payment });
}
