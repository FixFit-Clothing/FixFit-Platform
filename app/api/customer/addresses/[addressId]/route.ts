import { NextResponse } from "next/server";

import { parseAddressInput, toCustomerAddress } from "@/lib/customer";
import { getAuthenticatedCustomer } from "@/lib/customer-server";

export const dynamic = "force-dynamic";

type AddressRouteContext = {
  params: Promise<{ addressId: string }>;
};

function unauthorized() {
  return NextResponse.json(
    { error: "Sign in to manage your addresses." },
    { status: 401 }
  );
}

export async function PUT(request: Request, context: AddressRouteContext) {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  const { addressId } = await context.params;
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

  // Check ownership through the authenticated/RLS-scoped client before any
  // default-address side effect. A guessed ID must not alter this customer's
  // existing default address.
  const current = await customer.supabase
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .maybeSingle();

  if (current.error) {
    return NextResponse.json(
      { error: "We could not load your address right now." },
      { status: 500 }
    );
  }
  if (!current.data) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  if (parsed.value.isDefault) {
    const unsetDefaults = await customer.supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("profile_id", customer.userId)
      .eq("is_default", true)
      .neq("id", addressId);

    if (unsetDefaults.error) {
      return NextResponse.json(
        { error: "We could not update your default address." },
        { status: 500 }
      );
    }
  }

  const updated = await customer.supabase
    .from("addresses")
    .update({
      address_line1: parsed.value.addressLine1,
      landmark: parsed.value.landmark,
      locality: parsed.value.locality,
      city: parsed.value.city,
      is_default: parsed.value.isDefault,
    })
    .eq("id", addressId)
    .select("id, address_line1, landmark, locality, city, is_default")
    .maybeSingle();

  if (updated.error) {
    return NextResponse.json(
      { error: "We could not save your address right now." },
      { status: 500 }
    );
  }
  if (!updated.data)
    return NextResponse.json({ error: "Address not found." }, { status: 404 });

  return NextResponse.json({ address: toCustomerAddress(updated.data) });
}

export async function DELETE(_request: Request, context: AddressRouteContext) {
  const customer = await getAuthenticatedCustomer();
  if (!customer) return unauthorized();

  const { addressId } = await context.params;
  const deleted = await customer.supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .select("id")
    .maybeSingle();

  if (deleted.error) {
    return NextResponse.json(
      { error: "We could not delete your address right now." },
      { status: 500 }
    );
  }
  if (!deleted.data) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
