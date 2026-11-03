import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutConfirmation } from "@/components/checkout/CheckoutConfirmation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review booking",
  description: "Review your saved FixFit booking draft.",
};

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [query, supabase] = await Promise.all([searchParams, createClient()]);
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login?next=%2Fcheckout%2Fconfirm");
  }

  return <CheckoutConfirmation loginSucceeded={query.auth === "success"} />;
}
