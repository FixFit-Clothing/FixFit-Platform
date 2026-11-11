import { NextResponse } from "next/server";

import {
  createOrderRequestSchema,
  toRpcItems,
  type CreatedOrder,
} from "@/lib/order-creation";
import { getAuthenticatedCustomer } from "@/lib/customer-server";

export const dynamic = "force-dynamic";

type RpcOrderRow = {
  order_id: string;
  order_reference: string;
  order_status: "pending";
  created_at: string;
  estimated_work_amount: number;
  booking_fee_amount: number;
  rush_fee_amount: number;
  final_payable_amount: number | null;
};

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in to create a booking." },
    { status: 401 }
  );
}

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function logOrderError(error: {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  console.error("[customer-orders] Supabase RPC failed", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function POST(request: Request) {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Invalid booking details.");
  }

  const parsed = createOrderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid booking details.");
  }

  const { data, error } = await customer.supabase.rpc(
    "fixfit_create_customer_order",
    {
      p_idempotency_key: parsed.data.idempotencyKey,
      p_address_id: parsed.data.addressId,
      p_payment_method: parsed.data.paymentMethod,
      p_items: toRpcItems(parsed.data.items),
    }
  );

  if (error) {
    logOrderError(error);
    // The RPC intentionally exposes only fixed booking-validation messages.
    if (error.code === "P0001") {
      if (error.message.includes("submission key")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return validationError(
        error.message || "We could not create your booking."
      );
    }
    return NextResponse.json(
      { error: "We could not create your booking right now." },
      { status: 500 }
    );
  }

  const row = Array.isArray(data)
    ? (data[0] as RpcOrderRow | undefined)
    : undefined;
  if (!row) {
    console.error("[customer-orders] RPC returned no order row");
    return NextResponse.json(
      { error: "We could not create your booking right now." },
      { status: 500 }
    );
  }

  const order: CreatedOrder = {
    id: row.order_id,
    reference: row.order_reference,
    status: row.order_status,
    createdAt: row.created_at,
    estimatedWorkAmount: row.estimated_work_amount,
    bookingFeeAmount: row.booking_fee_amount,
    rushFeeAmount: row.rush_fee_amount,
    finalPayableAmount: row.final_payable_amount,
  };

  return NextResponse.json(
    { order, idempotencyKey: parsed.data.idempotencyKey },
    { status: 201 }
  );
}
