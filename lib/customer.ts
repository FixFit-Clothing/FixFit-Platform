export type CustomerProfile = {
  fullName: string | null;
  phone: string | null;
  email: string;
};

export type CustomerAddress = {
  id: string;
  addressLine1: string;
  landmark: string | null;
  locality: string;
  city: string;
  isDefault: boolean;
};

export type ProfileInput = {
  fullName: string;
  phone: string | null;
};

export type AddressInput = {
  addressLine1: string;
  landmark: string | null;
  locality: string;
  city: string;
  isDefault: boolean;
};

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned.length > 0 && cleaned.length <= maxLength ? cleaned : null;
}

function optionalText(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === "") return null;
  return cleanText(value, maxLength);
}

export function parseProfileInput(value: unknown): ParseResult<ProfileInput> {
  if (!isRecord(value)) return { ok: false, error: "Invalid profile details." };

  const fullName = cleanText(value.fullName, 120);
  if (!fullName) {
    return { ok: false, error: "Enter a full name of up to 120 characters." };
  }

  const phoneValue = optionalText(value.phone, 20);
  if (value.phone !== null && value.phone !== undefined && !phoneValue) {
    return {
      ok: false,
      error: "Enter a valid phone number or leave it blank.",
    };
  }

  const phone = phoneValue?.replace(/[\s()-]/g, "") ?? null;
  if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
    return {
      ok: false,
      error: "Enter a valid phone number or leave it blank.",
    };
  }

  return { ok: true, value: { fullName, phone } };
}

export function parseAddressInput(value: unknown): ParseResult<AddressInput> {
  if (!isRecord(value)) return { ok: false, error: "Invalid address details." };

  const addressLine1 = cleanText(value.addressLine1, 240);
  const locality = cleanText(value.locality, 120);
  const city = cleanText(value.city, 120);
  const landmark = optionalText(value.landmark, 160);

  if (!addressLine1 || !locality || !city) {
    return {
      ok: false,
      error: "Enter an address, locality, and city using the allowed lengths.",
    };
  }
  if (value.landmark !== null && value.landmark !== undefined && !landmark) {
    return { ok: false, error: "Landmark must be 160 characters or fewer." };
  }
  if (typeof value.isDefault !== "boolean") {
    return { ok: false, error: "Choose whether this is your default address." };
  }

  return {
    ok: true,
    value: {
      addressLine1,
      landmark,
      locality,
      city,
      isDefault: value.isDefault,
    },
  };
}

export function toCustomerAddress(value: {
  id: string;
  address_line1: string;
  landmark: string | null;
  locality: string;
  city: string;
  is_default: boolean;
}): CustomerAddress {
  return {
    id: value.id,
    addressLine1: value.address_line1,
    landmark: value.landmark,
    locality: value.locality,
    city: value.city,
    isDefault: value.is_default,
  };
}

export function formatCustomerAddress(address: CustomerAddress) {
  return [address.addressLine1, address.locality, address.city]
    .filter(Boolean)
    .join(", ");
}
