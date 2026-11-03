"use client";

import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import type { CustomerAddress, CustomerProfile } from "@/lib/customer";

type AddressForm = {
  addressLine1: string;
  landmark: string;
  locality: string;
  city: string;
  isDefault: boolean;
};

const emptyAddress: AddressForm = {
  addressLine1: "",
  landmark: "",
  locality: "HSR Layout",
  city: "Bengaluru",
  isDefault: false,
};

function toAddressForm(address: CustomerAddress): AddressForm {
  return {
    addressLine1: address.addressLine1,
    landmark: address.landmark ?? "",
    locality: address.locality,
    city: address.city,
    isDefault: address.isDefault,
  };
}

async function getJson<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      typeof body === "object" && body !== null && "error" in body
        ? (body as { error?: unknown }).error
        : null;
    throw new Error(typeof error === "string" ? error : "Request failed.");
  }

  return body as T;
}

export function CustomerProfileAndAddresses() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);

  async function loadCustomerData() {
    const [profileResponse, addressesResponse] = await Promise.all([
      getJson<{ profile: CustomerProfile }>("/api/customer/profile"),
      getJson<{ addresses: CustomerAddress[] }>("/api/customer/addresses"),
    ]);
    setProfile(profileResponse.profile);
    setAddresses(addressesResponse.addresses);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadCustomerData()
        .catch(() =>
          setError("We could not load your customer details right now.")
        )
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setIsSavingProfile(true);
    setError(null);
    try {
      const response = await getJson<{ profile: CustomerProfile }>(
        "/api/customer/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            fullName: profile.fullName ?? "",
            phone: profile.phone,
          }),
        }
      );
      setProfile(response.profile);
      toast.success("Profile saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your profile."
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  function beginAddressEdit(address?: CustomerAddress) {
    setEditingAddressId(address?.id ?? null);
    setAddressForm(address ? toAddressForm(address) : emptyAddress);
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingAddress(true);
    setError(null);

    try {
      const response = await getJson<{ address: CustomerAddress }>(
        editingAddressId
          ? `/api/customer/addresses/${editingAddressId}`
          : "/api/customer/addresses",
        {
          method: editingAddressId ? "PUT" : "POST",
          body: JSON.stringify(addressForm),
        }
      );

      setAddresses((current) => {
        const next = editingAddressId
          ? current.map((address) =>
              address.id === response.address.id ? response.address : address
            )
          : [...current, response.address];
        return [...next].sort(
          (left, right) => Number(right.isDefault) - Number(left.isDefault)
        );
      });
      beginAddressEdit();
      toast.success(editingAddressId ? "Address updated." : "Address saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your address."
      );
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function deleteAddress(addressId: string) {
    setError(null);
    try {
      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Could not delete your address.");
      setAddresses((current) =>
        current.filter((address) => address.id !== addressId)
      );
      if (editingAddressId === addressId) beginAddressEdit();
      toast.success("Address deleted.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete your address."
      );
    }
  }

  if (isLoading) {
    return (
      <p className="account-loading">
        Loading your profile and saved addresses…
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="auth-error" role="alert">
        {error ?? "We could not load your customer details."}
      </p>
    );
  }

  return (
    <div className="account-details">
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <section
        className="account-section"
        aria-labelledby="profile-details-title"
      >
        <div>
          <h2 id="profile-details-title">Profile details</h2>
          <p>Keep your contact information ready for your booking.</p>
        </div>
        <form className="auth-form" onSubmit={saveProfile} noValidate>
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            value={profile.fullName ?? ""}
            onChange={(event) =>
              setProfile((current) =>
                current ? { ...current, fullName: event.target.value } : current
              )
            }
            disabled={isSavingProfile}
            required
          />
          <label htmlFor="profile-email">Email address</label>
          <input
            id="profile-email"
            value={profile.email}
            readOnly
            aria-readonly="true"
          />
          <label htmlFor="profile-phone">Phone number</label>
          <input
            id="profile-phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Required before booking"
            value={profile.phone ?? ""}
            onChange={(event) =>
              setProfile((current) =>
                current ? { ...current, phone: event.target.value } : current
              )
            }
            disabled={isSavingProfile}
          />
          <small className="account-helper">
            Your phone number is not verified in this step, but it will be
            required before booking.
          </small>
          <button
            className="btn-primary auth-submit"
            disabled={isSavingProfile}
            type="submit"
          >
            {isSavingProfile ? "Saving profile…" : "Save profile"}
          </button>
        </form>
      </section>

      <section
        className="account-section"
        aria-labelledby="saved-addresses-title"
      >
        <div className="account-section-heading">
          <div>
            <h2 id="saved-addresses-title">Saved addresses</h2>
            <p>Use a saved pickup address for future FixFit visits.</p>
          </div>
          <button
            className="auth-text-button"
            onClick={() => beginAddressEdit()}
            type="button"
          >
            Add address
          </button>
        </div>

        {addresses.length ? (
          <div className="saved-addresses">
            {addresses.map((address) => (
              <article className="saved-address" key={address.id}>
                <div>
                  <strong>{address.addressLine1}</strong>
                  <p>
                    {address.locality}, {address.city}
                    {address.landmark ? ` · ${address.landmark}` : ""}
                  </p>
                  {address.isDefault ? (
                    <span>Default pickup address</span>
                  ) : null}
                </div>
                <div className="saved-address-actions">
                  <button
                    className="auth-text-button"
                    onClick={() => beginAddressEdit(address)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="auth-text-button"
                    onClick={() => void deleteAddress(address.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="account-empty">No saved addresses yet.</p>
        )}

        <form
          className="auth-form account-address-form"
          onSubmit={saveAddress}
          noValidate
        >
          <h3>{editingAddressId ? "Edit address" : "Add an address"}</h3>
          <label htmlFor="address-line1">Address line</label>
          <input
            id="address-line1"
            value={addressForm.addressLine1}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                addressLine1: event.target.value,
              }))
            }
            disabled={isSavingAddress}
            required
          />
          <label htmlFor="address-landmark">Landmark (optional)</label>
          <input
            id="address-landmark"
            value={addressForm.landmark}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                landmark: event.target.value,
              }))
            }
            disabled={isSavingAddress}
          />
          <label htmlFor="address-locality">Locality</label>
          <input
            id="address-locality"
            value={addressForm.locality}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                locality: event.target.value,
              }))
            }
            disabled={isSavingAddress}
            required
          />
          <label htmlFor="address-city">City</label>
          <input
            id="address-city"
            value={addressForm.city}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                city: event.target.value,
              }))
            }
            disabled={isSavingAddress}
            required
          />
          <label className="account-checkbox">
            <input
              checked={addressForm.isDefault}
              onChange={(event) =>
                setAddressForm((current) => ({
                  ...current,
                  isDefault: event.target.checked,
                }))
              }
              disabled={isSavingAddress}
              type="checkbox"
            />
            Set as default pickup address
          </label>
          <button
            className="btn-primary auth-submit"
            disabled={isSavingAddress}
            type="submit"
          >
            {isSavingAddress
              ? "Saving address…"
              : editingAddressId
                ? "Save address"
                : "Add address"}
          </button>
        </form>
      </section>
    </div>
  );
}
