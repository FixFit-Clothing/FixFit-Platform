import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking details",
  description: "Review your FixFit booking details.",
};

type OrderOption = { id: string; option_name_snapshot: string };
type OrderIssue = {
  id: string;
  issue_name_snapshot: string;
  issue_category_snapshot: string;
  order_item_options: OrderOption[];
};
type OrderItem = {
  id: string;
  garment_name_snapshot: string;
  service_tier_name_snapshot: string;
  service_tier_turnaround_snapshot: string;
  is_rush: boolean;
  rush_fee_amount: number;
  estimate_from_amount: number | null;
  order_item_issues: OrderIssue[];
};
type CustomerOrder = {
  id: string;
  order_reference: string;
  status: string;
  created_at: string;
  estimated_work_amount: number | null;
  booking_fee_amount: number;
  rush_fee_amount: number;
  final_payable_amount: number | null;
  pickup_address_line1_snapshot: string | null;
  pickup_landmark_snapshot: string | null;
  pickup_locality_snapshot: string | null;
  pickup_city_snapshot: string | null;
  order_items: OrderItem[];
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getOrderStatusCopy(status: string) {
  if (status === "confirmed") {
    return {
      eyebrow: "Booking confirmed",
      title: "Your FixFit booking is confirmed",
      detail:
        "Your booking has been confirmed. Design-executive allocation will be shared when available.",
    };
  }

  if (status === "cancelled") {
    return {
      eyebrow: "Booking cancelled",
      title: "This FixFit booking was cancelled",
      detail: "This booking is no longer active.",
    };
  }

  return {
    eyebrow: "Booking created",
    title: "Your FixFit booking has been created",
    detail:
      "We received your booking. We’ll share the next step when it is ready.",
  };
}

function formatCategory(category: string) {
  return `${category.slice(0, 1).toUpperCase()}${category.slice(1)}`;
}

export default async function CustomerOrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!isUuid(orderId)) notFound();

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    redirect(`/login?next=${encodeURIComponent(`/account/orders/${orderId}`)}`);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_reference,
        status,
        created_at,
        estimated_work_amount,
        booking_fee_amount,
        rush_fee_amount,
        final_payable_amount,
        pickup_address_line1_snapshot,
        pickup_landmark_snapshot,
        pickup_locality_snapshot,
        pickup_city_snapshot,
        order_items (
          id,
          garment_name_snapshot,
          service_tier_name_snapshot,
          service_tier_turnaround_snapshot,
          is_rush,
          rush_fee_amount,
          estimate_from_amount,
          order_item_issues (
            id,
            issue_name_snapshot,
            issue_category_snapshot,
            order_item_options (
              id,
              option_name_snapshot
            )
          )
        )
      `
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) notFound();
  const order = data as CustomerOrder;
  const initialPayable = order.booking_fee_amount + order.rush_fee_amount;
  const statusCopy = getOrderStatusCopy(order.status);
  const pickupAddress = [
    order.pickup_address_line1_snapshot,
    order.pickup_locality_snapshot,
    order.pickup_city_snapshot,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="checkout-page">
      <section
        className="site-wrap checkout-shell"
        aria-labelledby="order-title"
      >
        <header className="section-head checkout-header">
          <p className="section-eyebrow">{statusCopy.eyebrow}</p>
          <h1 className="section-title" id="order-title">
            {statusCopy.title}
          </h1>
          <p>
            Reference <strong>{order.order_reference}</strong> · Created{" "}
            {new Date(order.created_at).toLocaleDateString("en-IN")}
          </p>
          <p>{statusCopy.detail}</p>
        </header>

        <div className="checkout-card">
          <section className="order-detail-section">
            <h2>Selected garments</h2>
            <div className="estimator-cart">
              {order.order_items.map((item) => (
                <div className="estimator-cart-item" key={item.id}>
                  <div>
                    <strong>{item.garment_name_snapshot}</strong>
                    <p>
                      {item.order_item_issues
                        .map((issue) => {
                          const options = issue.order_item_options
                            .map((option) => option.option_name_snapshot)
                            .join(", ");
                          const selection = `${formatCategory(
                            issue.issue_category_snapshot
                          )}: ${issue.issue_name_snapshot}`;
                          return options
                            ? `${selection} → ${options}`
                            : selection;
                        })
                        .join(" · ")}
                    </p>
                    <small>
                      {item.service_tier_name_snapshot} ·{" "}
                      {item.service_tier_turnaround_snapshot}
                      {item.is_rush ? " · Rush selected" : ""}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="order-detail-section">
            <h2>Pricing summary</h2>
            <div className="estimator-summary">
              <p>
                <span>Estimated work amount</span>
                <strong>{formatMoney(order.estimated_work_amount ?? 0)}</strong>
              </p>
              <p>
                <span>Booking fee</span>
                <strong>{formatMoney(order.booking_fee_amount)}</strong>
              </p>
              <p>
                <span>Rush fee</span>
                <strong>{formatMoney(order.rush_fee_amount)}</strong>
              </p>
              <p className="total">
                <span>Initial amount due</span>
                <strong>{formatMoney(initialPayable)}</strong>
              </p>
            </div>
          </section>

          <section className="order-detail-section">
            <h2>Pickup address</h2>
            <dl className="checkout-details">
              <div>
                <dt>Service address</dt>
                <dd>{pickupAddress || "Address saved with this order."}</dd>
              </div>
              {order.pickup_landmark_snapshot ? (
                <div>
                  <dt>Landmark</dt>
                  <dd>{order.pickup_landmark_snapshot}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <p className="checkout-phone-gate">
            The final work amount is determined after your garment assessment.
            The booking fee is credited against that final bill.
          </p>

          <div className="checkout-actions">
            <Link className="estimator-primary" href="/account">
              View my account
            </Link>
            <Link className="estimator-secondary" href="/estimator">
              Start another booking
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
