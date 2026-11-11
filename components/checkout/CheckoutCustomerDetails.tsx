"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  formatCustomerAddress,
  type CustomerAddress,
  type CustomerProfile,
} from "@/lib/customer";
import { type BookingDraft } from "@/lib/booking-draft";

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

type CheckoutCustomerDetailsProps = {
  draft: BookingDraft;
  onDraftUpdated: (
    draft: BookingDraft,
    options?: { invalidatePendingSubmission?: boolean }
  ) => boolean;
};

export function CheckoutCustomerDetails({
  draft,
  onDraftUpdated,
}: CheckoutCustomerDetailsProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomerData = useCallback(async () => {
    const [profileResponse, addressesResponse] = await Promise.all([
      getJson<{ profile: CustomerProfile }>("/api/customer/profile"),
      getJson<{ addresses: CustomerAddress[] }>("/api/customer/addresses"),
    ]);
    setProfile(profileResponse.profile);
    setAddresses(addressesResponse.addresses);
    const defaultAddress = addressesResponse.addresses.find(
      (address) => address.isDefault
    );
    const draftAddress = addressesResponse.addresses.find(
      (address) => address.id === draft.addressId
    );
    setSelectedAddressId(
      draftAddress?.id ??
        defaultAddress?.id ??
        addressesResponse.addresses[0]?.id ??
        null
    );
  }, [draft.addressId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadCustomerData()
        .catch(() => setError("We could not load your saved customer details."))
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadCustomerData]);

  function beginEdit(address?: CustomerAddress) {
    setEditingAddressId(address?.id ?? null);
    setAddressForm(address ? toAddressForm(address) : emptyAddress);
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const editingSelectedAddress =
      editingAddressId !== null && editingAddressId === selectedAddressId;
    setIsSaving(true);
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
      setSelectedAddressId(response.address.id);
      beginEdit();
      if (editingSelectedAddress) {
        const updatedDraft: BookingDraft = {
          ...draft,
          addressId: response.address.id,
          address: formatCustomerAddress(response.address),
          landmark: response.address.landmark ?? "",
        };
        if (
          !onDraftUpdated(updatedDraft, { invalidatePendingSubmission: true })
        ) {
          setError(
            "Your address was saved, but we could not update this booking draft. Reload the page before submitting."
          );
          return;
        }
      }
      toast.success(editingAddressId ? "Address updated." : "Address saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your address."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function useSelectedAddress() {
    const selected = addresses.find(
      (address) => address.id === selectedAddressId
    );
    if (!selected) return;

    const updatedDraft = {
      ...draft,
      addressId: selected.id,
      address: formatCustomerAddress(selected),
      landmark: selected.landmark ?? "",
    };
    if (!onDraftUpdated(updatedDraft)) {
      setError(
        "We could not update this booking draft on this device. Please try again."
      );
      return;
    }
    toast.success("Saved address applied to this booking draft.");
  }

  return (
    <section
      className="checkout-customer"
      aria-labelledby="checkout-customer-title"
    >
      <div className="checkout-customer-heading">
        <div>
          <h2 id="checkout-customer-title">Pickup details</h2>
          <p>Choose or update the address for this booking draft.</p>
        </div>
        <Link className="auth-text-button" href="/account">
          Manage profile
        </Link>
      </div>

      {isLoading ? (
        <p className="account-loading">Loading saved details…</p>
      ) : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {!isLoading && profile && !profile.phone ? (
        <p className="auth-error" role="alert">
          Add a phone number in <Link href="/account">My Account</Link> before
          booking.
        </p>
      ) : null}

      {!isLoading && addresses.length ? (
        <div
          className="checkout-addresses"
          role="radiogroup"
          aria-label="Saved pickup addresses"
        >
          {addresses.map((address) => (
            <div className="checkout-address-choice" key={address.id}>
              <label className="checkout-address-select">
                <input
                  checked={selectedAddressId === address.id}
                  name="saved-address"
                  onChange={() => setSelectedAddressId(address.id)}
                  type="radio"
                />
                <span>
                  <strong>{address.addressLine1}</strong>
                  <small>
                    {address.locality}, {address.city}
                    {address.landmark ? ` · ${address.landmark}` : ""}
                    {address.isDefault ? " · Default" : ""}
                  </small>
                </span>
              </label>
              <button
                className="auth-text-button"
                onClick={() => beginEdit(address)}
                type="button"
              >
                Edit
              </button>
            </div>
          ))}
          <button
            className="estimator-secondary"
            onClick={useSelectedAddress}
            type="button"
          >
            Use selected address for this draft
          </button>
        </div>
      ) : null}

      <button
        className="auth-text-button"
        onClick={() => beginEdit()}
        type="button"
      >
        {addresses.length
          ? "Add another address"
          : "Add a saved pickup address"}
      </button>

      <form
        className="auth-form checkout-address-form"
        onSubmit={saveAddress}
        noValidate
      >
        <h3>
          {editingAddressId ? "Edit saved address" : "Save a pickup address"}
        </h3>
        <label htmlFor="checkout-address-line">Address line</label>
        <input
          id="checkout-address-line"
          value={addressForm.addressLine1}
          onChange={(event) =>
            setAddressForm((current) => ({
              ...current,
              addressLine1: event.target.value,
            }))
          }
          disabled={isSaving}
          required
        />
        <label htmlFor="checkout-landmark">Landmark (optional)</label>
        <input
          id="checkout-landmark"
          value={addressForm.landmark}
          onChange={(event) =>
            setAddressForm((current) => ({
              ...current,
              landmark: event.target.value,
            }))
          }
          disabled={isSaving}
        />
        <label htmlFor="checkout-locality">Locality</label>
        <input
          id="checkout-locality"
          value={addressForm.locality}
          onChange={(event) =>
            setAddressForm((current) => ({
              ...current,
              locality: event.target.value,
            }))
          }
          disabled={isSaving}
          required
        />
        <label htmlFor="checkout-city">City</label>
        <input
          id="checkout-city"
          value={addressForm.city}
          onChange={(event) =>
            setAddressForm((current) => ({
              ...current,
              city: event.target.value,
            }))
          }
          disabled={isSaving}
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
            disabled={isSaving}
            type="checkbox"
          />
          Set as default pickup address
        </label>
        <button
          className="btn-primary auth-submit"
          disabled={isSaving}
          type="submit"
        >
          {isSaving
            ? "Saving address…"
            : editingAddressId
              ? "Save address"
              : "Add address"}
        </button>
      </form>

      <p className="checkout-phone-gate">
        {profile?.phone
          ? "Your phone number is saved. You can create a booking after choosing a saved pickup address."
          : "A saved phone number is required before booking can continue."}
      </p>
    </section>
  );
}
