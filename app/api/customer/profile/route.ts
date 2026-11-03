import { NextResponse } from "next/server";

import { parseProfileInput } from "@/lib/customer";
import {
  ensureCustomerProfile,
  getAuthenticatedCustomer,
} from "@/lib/customer-server";

export const dynamic = "force-dynamic";

type SupabaseErrorDetails = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logProfileError(operation: string, error: SupabaseErrorDetails) {
  // This stays server-side. Do not log request fields, user IDs, sessions, or
  // other customer data; Supabase error metadata is enough to diagnose SQL,
  // RLS, or return-shape failures safely.
  console.error("[customer-profile] Supabase operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in to manage your profile." },
    { status: 401 }
  );
}

export async function GET() {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  const profile = await ensureCustomerProfile(customer);
  if (profile.error || !profile.data) {
    if (profile.error) logProfileError("ensure-for-get", profile.error);
    return NextResponse.json(
      { error: "We could not load your profile right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    profile: {
      fullName: profile.data.full_name,
      phone: profile.data.phone,
      email: customer.email,
    },
  });
}

export async function PUT(request: Request) {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid profile details." },
      { status: 400 }
    );
  }

  const parsed = parseProfileInput(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const profile = await ensureCustomerProfile(customer);
  if (profile.error) {
    logProfileError("ensure-for-put", profile.error);
    return NextResponse.json(
      { error: "We could not prepare your profile for saving." },
      { status: 500 }
    );
  }

  const updated = await customer.supabase
    .from("profiles")
    .update({
      full_name: parsed.value.fullName,
      phone: parsed.value.phone,
    })
    .eq("id", customer.userId)
    .select("full_name, phone")
    .maybeSingle();

  if (updated.error || !updated.data) {
    if (updated.error) logProfileError("update", updated.error);
    if (!updated.error && !updated.data) {
      console.error("[customer-profile] Profile update returned no row", {
        operation: "update",
      });
    }
    return NextResponse.json(
      { error: "We could not save your profile right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    profile: {
      fullName: updated.data.full_name,
      phone: updated.data.phone,
      email: customer.email,
    },
  });
}
