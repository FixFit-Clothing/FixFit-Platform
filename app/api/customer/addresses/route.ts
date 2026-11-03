import { NextResponse } from "next/server";

import { parseAddressInput, toCustomerAddress } from "@/lib/customer";
import {
  type AuthenticatedCustomer,
  ensureCustomerProfile,
  getAuthenticatedCustomer,
} from "@/lib/customer-server";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in to manage your addresses." },
    { status: 401 }
  );
}

async function getAddresses(customer: AuthenticatedCustomer) {
  return customer.supabase
    .from("addresses")
    .select("id, address_line1, landmark, locality, city, is_default")
    .eq("profile_id", customer.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
}

export async function GET() {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  const addresses = await getAddresses(customer);
  if (addresses.error) {
    return NextResponse.json(
      { error: "We could not load your saved addresses right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    addresses: (addresses.data ?? []).map(toCustomerAddress),
  });
}

export async function POST(request: Request) {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid address details." },
      { status: 400 }
    );
  }

  const parsed = parseAddressInput(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const profile = await ensureCustomerProfile(customer);
  if (profile.error) {
    return NextResponse.json(
      { error: "We could not prepare your profile for saving an address." },
      { status: 500 }
    );
  }

  const existing = await getAddresses(customer);
  if (existing.error) {
    return NextResponse.json(
      { error: "We could not prepare your address for saving." },
      { status: 500 }
    );
  }

  const shouldBeDefault =
    parsed.value.isDefault || (existing.data?.length ?? 0) === 0;
  if (shouldBeDefault) {
    const unsetDefaults = await customer.supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("profile_id", customer.userId)
      .eq("is_default", true);

    if (unsetDefaults.error) {
      return NextResponse.json(
        { error: "We could not update your default address." },
        { status: 500 }
      );
    }
  }

  const created = await customer.supabase
    .from("addresses")
    .insert({
      profile_id: customer.userId,
      address_line1: parsed.value.addressLine1,
      landmark: parsed.value.landmark,
      locality: parsed.value.locality,
      city: parsed.value.city,
      is_default: shouldBeDefault,
    })
    .select("id, address_line1, landmark, locality, city, is_default")
    .single();

  if (created.error || !created.data) {
    return NextResponse.json(
      { error: "We could not save your address right now." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { address: toCustomerAddress(created.data) },
    { status: 201 }
  );
}
