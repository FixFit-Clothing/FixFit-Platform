import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { CustomerProfileAndAddresses } from "@/components/account/CustomerProfileAndAddresses";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  description: "Your FixFit customer account.",
};

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
      "id, status, created_at, final_payable_amount, estimated_work_amount"
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
              <ul>
                {orders.map((order) => (
                  <li key={order.id}>
                    <strong>{order.status}</strong> ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </li>
                ))}
              </ul>
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
