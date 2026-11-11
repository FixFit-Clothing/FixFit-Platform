import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { CustomerProfileAndAddresses } from "@/components/account/CustomerProfileAndAddresses";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  description: "Your FixFit customer account.",
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
  order_item_issues: OrderIssue[];
};
type AccountOrder = {
  id: string;
  order_reference: string;
  status: string;
  created_at: string;
  booking_fee_amount: number;
  rush_fee_amount: number;
  estimated_work_amount: number | null;
  final_payable_amount: number | null;
  pickup_address_line1_snapshot: string | null;
  pickup_landmark_snapshot: string | null;
  pickup_locality_snapshot: string | null;
  pickup_city_snapshot: string | null;
  order_items: OrderItem[];
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCategory(category: string) {
  return `${category.slice(0, 1).toUpperCase()}${category.slice(1)}`;
}

function getOrderStatusCopy(status: string) {
  if (status === "confirmed") {
    return {
      label: "Booking confirmed",
      detail:
        "Your visit is confirmed. We will share the next operational update when available.",
    };
  }
  if (status === "cancelled") {
    return {
      label: "Booking cancelled",
      detail: "This booking is no longer active.",
    };
  }
  if (status === "draft") {
    return {
      label: "Booking draft",
      detail: "This booking has not been confirmed yet.",
    };
  }
  return {
    label: "Booking created",
    detail:
      "We received your booking. Review the saved details below while we prepare the next step.",
  };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login?next=%2Faccount");
  }

  const email = typeof claims.email === "string" ? claims.email : "your email";
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_reference,
        status,
        created_at,
        booking_fee_amount,
        rush_fee_amount,
        estimated_work_amount,
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
    .order("created_at", { ascending: false });

  return (
    <main className="account-page">
      <div className="site-wrap account-page-content">
        <section className="account-card" aria-labelledby="account-title">
          <p className="section-eyebrow">Customer account</p>
          <h1 className="account-title" id="account-title">
            You’re signed in
          </h1>
          <p className="account-description">
            Signed in as <strong>{email}</strong>. Manage your booking contact
            details and pickup addresses below.
          </p>
          {query.auth === "success" ? (
            <p className="auth-message" role="status">
              You&apos;re signed in successfully.
            </p>
          ) : null}
          <SignOutButton className="btn-primary auth-submit" />
          <CustomerProfileAndAddresses />
          <section
            className="account-history"
            aria-labelledby="order-history-title"
          >
            <h2 id="order-history-title">Order history</h2>
            {ordersError ? (
              <p>We couldn&apos;t load your order history right now.</p>
            ) : orders?.length ? (
              <div className="account-orders">
                {(orders as AccountOrder[]).map((order) => {
                  const status = getOrderStatusCopy(order.status);
                  const initialAmountDue =
                    order.booking_fee_amount + order.rush_fee_amount;
                  const pickupAddress = [
                    order.pickup_address_line1_snapshot,
                    order.pickup_locality_snapshot,
                    order.pickup_city_snapshot,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <article className="account-order" key={order.id}>
                      <header className="account-order-header">
                        <div>
                          <p className="account-order-reference">
                            {order.order_reference}
                          </p>
                          <p>
                            Created{" "}
                            {new Date(order.created_at).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <Link
                          className="auth-text-button"
                          href={`/account/orders/${order.id}`}
                        >
                          View details
                        </Link>
                      </header>

                      <section className="account-order-section">
                        <h3>{status.label}</h3>
                        <p>{status.detail}</p>
                      </section>

                      <section className="account-order-section">
                        <h3>Selected garments</h3>
                        <ul className="account-order-items">
                          {order.order_items.map((item) => (
                            <li key={item.id}>
                              <strong>{item.garment_name_snapshot}</strong>
                              <span>
                                1 garment · {item.service_tier_name_snapshot} ·{" "}
                                {item.service_tier_turnaround_snapshot}
                                {item.is_rush ? " · Rush selected" : ""}
                              </span>
                              <ul>
                                {item.order_item_issues.map((issue) => {
                                  const options = issue.order_item_options
                                    .map(
                                      (option) => option.option_name_snapshot
                                    )
                                    .join(", ");
                                  return (
                                    <li key={issue.id}>
                                      {formatCategory(
                                        issue.issue_category_snapshot
                                      )}
                                      : {issue.issue_name_snapshot}
                                      {options ? ` — ${options}` : ""}
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="account-order-section account-order-pricing">
                        <h3>Pricing summary</h3>
                        <p>
                          <span>Booking fee</span>
                          <strong>
                            {formatMoney(order.booking_fee_amount)}
                          </strong>
                        </p>
                        {order.rush_fee_amount > 0 ? (
                          <p>
                            <span>Rush fee</span>
                            <strong>
                              {formatMoney(order.rush_fee_amount)}
                            </strong>
                          </p>
                        ) : null}
                        {order.estimated_work_amount !== null ? (
                          <p>
                            <span>Estimated work amount</span>
                            <strong>
                              {formatMoney(order.estimated_work_amount)}
                            </strong>
                          </p>
                        ) : null}
                        <p className="total">
                          <span>Initial amount due</span>
                          <strong>{formatMoney(initialAmountDue)}</strong>
                        </p>
                        {order.final_payable_amount !== null ? (
                          <p>
                            <span>Final payable amount</span>
                            <strong>
                              {formatMoney(order.final_payable_amount)}
                            </strong>
                          </p>
                        ) : null}
                      </section>

                      <section className="account-order-section">
                        <h3>Pickup address</h3>
                        <p>
                          {pickupAddress || "Address saved with this order."}
                        </p>
                        {order.pickup_landmark_snapshot ? (
                          <p>Landmark: {order.pickup_landmark_snapshot}</p>
                        ) : null}
                      </section>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p>
                No bookings yet. Your future FixFit visits will appear here.
              </p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
