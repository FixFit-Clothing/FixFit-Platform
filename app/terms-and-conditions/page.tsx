import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms governing FixFit's booking and pickup-and-fix service.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      summary="Last updated: September 2026 · Please read before booking a fix with FixFit."
    >
      <p>
        These terms govern your use of FixFit&apos;s website, WhatsApp booking,
        and pickup-and-fix service in HSR Layout, Bengaluru. By booking with us,
        you agree to them.
      </p>

      <h2>1. The service</h2>
      <p>
        FixFit sends a verified, ID-carrying Style Executive to pick up your
        garment, have it fixed by our tailor partners under her supervision, and
        return it to you for inspection before payment. Service tiers are
        SpotFix (≤30 min, on the spot), QuickFix (2–3 hrs) and ScheduleFix
        (same/next day).
      </p>

      <h2>2. Booking &amp; the ₹99 fee</h2>
      <p>
        A ₹99 booking fee confirms your slot and is adjusted against your final
        bill — it is not an additional charge. The price shown at booking is a
        starting anchor; your Style Executive confirms the exact price once she
        has assessed the garment in person, and will not proceed with the fix
        without your confirmation if it differs from the estimate.
      </p>

      <h2>3. Payment</h2>
      <p>
        The balance is due on delivery, after you&apos;ve inspected the
        completed fix, payable by UPI or cash. We do not ask you to pay the full
        amount upfront.
      </p>

      <h2>4. Verification</h2>
      <p>
        Every Style Executive carries a checkable ID (e.g.
        &quot;FX-BLR-001&quot;) and, where applicable, a one-time OTP you should
        confirm before handing over your garment or accepting delivery. Please
        do not hand over your garment to anyone who cannot verify their identity
        this way.
      </p>

      <h2>5. Garment condition &amp; liability</h2>
      <p>
        Front/back photographs are taken at pickup to record starting condition.
        If a fix is not done to the agreed specification, we will redo it at no
        extra charge under the FixFit Guarantee. In the rare event of fabric
        damage caused by our handling, we will cover reasonable repair or
        replacement cost up to the declared value of the garment at booking; we
        are not liable for pre-existing damage, normal wear, or issues not
        disclosed at pickup.
      </p>

      <h2>6. Cancellations</h2>
      <p>
        You may cancel before your Style Executive is dispatched for a full
        refund of the ₹99 fee. Once she has been dispatched, the booking fee is
        non-refundable, as it covers her time and travel — see our Refund Policy
        for full details.
      </p>

      <h2>7. Service area</h2>
      <p>
        We currently serve all 7 sectors of HSR Layout, Bengaluru. Bookings from
        outside this area may be declined or waitlisted as we expand to
        Koramangala and Indiranagar.
      </p>

      <h2>8. Conduct</h2>
      <p>
        We ask that customers treat Style Executives with respect. FixFit
        reserves the right to decline service in cases of abuse, unsafe
        conditions, or fraudulent bookings.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms from time to time; continued use of the
        service after changes are posted constitutes acceptance.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of India, with courts in Bengaluru,
        Karnataka having jurisdiction.
      </p>
    </LegalPage>
  );
}
