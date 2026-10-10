import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "FixFit's policy for booking fees, refunds, and claims.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      summary="Last updated: September 2026 · Read alongside our Terms & Conditions."
    >
      <h2>1. The ₹99 booking fee</h2>
      <ul>
        <li>
          <strong>Full refund</strong> if you cancel before a Style Executive
          has been dispatched to you.
        </li>
        <li>
          <strong>Full refund</strong> if FixFit is unable to serve your area or
          fails to dispatch anyone within the promised window.
        </li>
        <li>
          <strong>Non-refundable</strong> once your Style Executive has been
          dispatched and is en route, since this covers her time and travel — it
          is otherwise fully adjusted against your final bill.
        </li>
      </ul>

      <h2>2. The balance amount (paid on delivery)</h2>
      <p>
        You inspect every fix before paying the balance, so in the ordinary
        course there&apos;s nothing to refund. If, after payment, you find the
        fix wasn&apos;t done to the agreed specification, contact us within 48
        hours of delivery:
      </p>
      <ul>
        <li>
          We will <strong>redo the fix free of charge</strong> under the FixFit
          Guarantee — our default and preferred resolution.
        </li>
        <li>
          If a redo isn&apos;t possible or isn&apos;t what you want, we will
          refund the amount paid for that specific fix, in full or in part
          depending on the issue, at our discretion after reviewing the pickup
          and delivery photographs.
        </li>
      </ul>

      <h2>3. Fabric damage claims</h2>
      <p>
        If your garment is damaged due to our handling, we will cover reasonable
        repair or replacement cost up to the garment&apos;s declared value at
        booking. Claims must be raised within 48 hours of delivery, referencing
        your order ID and the pickup/delivery photographs.
      </p>

      <h2>4. How to request a refund</h2>
      <p>
        Message us on WhatsApp or reach the founder directly (see the contact
        button on this site) with your order ID and a brief description of the
        issue. We aim to respond within 24 hours and resolve most claims within
        3–5 business days.
      </p>

      <h2>5. Refund method &amp; timeline</h2>
      <p>
        Approved refunds are returned to the original payment method (UPI or
        card) within 5–7 business days, or handed back in cash if the original
        payment was cash.
      </p>
    </LegalPage>
  );
}
