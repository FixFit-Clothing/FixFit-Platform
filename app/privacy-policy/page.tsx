import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FixFit collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="Last updated: September 2026 · Applies to fixfit.in and the FixFit WhatsApp booking flow."
    >
      <p>
        FixFit (&quot;we&quot;, &quot;us&quot;) operates a garment pickup,
        alteration and repair service in HSR Layout, Bengaluru. This policy
        explains what information we collect when you use our website or
        WhatsApp to book a fix, and how we use it.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Contact details</strong> — name, phone number, and pickup
          address (flat/house no., landmark).
        </li>
        <li>
          <strong>Order details</strong> — garment type, the problem you
          describe, the tier and price selected.
        </li>
        <li>
          <strong>Garment photographs</strong> — the photo you add when booking,
          and the photos your Style Executive takes at pickup, used to confirm
          your quote, record the starting condition and support quality checks.
        </li>
        <li>
          <strong>Payment information</strong> — handled by our payment
          processor; we do not store your card or UPI credentials.
        </li>
        <li>
          <strong>Basic device data</strong> — the browser stores your
          in-progress order locally (see &quot;Local storage&quot; below) so the
          flow works smoothly on your device.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <p>
        We use your information to assign and dispatch a verified Style
        Executive, confirm pricing, track your order end-to-end, process
        payment, and follow up on feedback or a guarantee claim. Garment
        photographs are used only for quality assurance and dispute resolution —
        never for marketing without your separate consent.
      </p>

      <h2>3. Who we share it with</h2>
      <p>
        Your order details are shared only with the Style Executive assigned to
        your order and, where relevant, the tailor completing the fix. We do not
        sell your personal information to third parties. We may share limited
        data with payment processors solely to complete your transaction, and
        with authorities if legally required.
      </p>

      <h2>4. Local storage on this website</h2>
      <p>
        To make booking feel instant, this website temporarily stores your
        in-progress order (garment, problem, tier, order ID and the garment
        photo you add) in your browser&apos;s local storage. This data stays on
        your device, is not automatically sent to a server, and can be cleared
        any time by clearing your browser data.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain order records, including garment photographs, for as long as
        needed to resolve any quality claim (typically up to 90 days after
        delivery), and longer only where required for accounting or legal
        purposes.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask us to share, correct, or delete the personal information we
        hold about you by contacting us using the details below. We&apos;ll
        respond within a reasonable time.
      </p>

      <h2>7. Changes to this policy</h2>
      <p>
        We may update this policy as FixFit grows. Material changes will be
        reflected here with an updated date.
      </p>

      <h2>8. Contact us</h2>
      <p>
        Questions about this policy? Reach the founder directly — see the
        WhatsApp button on this site, or write to us via the contact details
        shared at booking.
      </p>
    </LegalPage>
  );
}
