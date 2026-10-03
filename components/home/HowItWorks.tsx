const steps = [
  {
    title: "Tell us what's wrong",
    description:
      "Pick your garment, add a photo of it, and choose the issue in the Estimator — takes seconds.",
  },
  {
    title: "Get an instant estimate",
    description: "See a real anchor price and book your executive right there.",
  },
  {
    title: "Priya arrives for pickup",
    description:
      "Verified, ID-carrying Style Executive. Share your OTP to confirm it's her.",
  },
  {
    title: "Tailor fix & quality check",
    description:
      "Priya supervises the fix and runs a quality checklist — matched to what was actually fixed — before it comes back.",
  },
  {
    title: "Inspect & pay on delivery",
    description: "You check it. Only then do you pay — UPI or cash.",
  },
];

export function HowItWorks() {
  return (
    <section className="home-section how-it-works">
      <div className="site-wrap">
        <div className="section-head how-it-works-head">
          <p className="section-eyebrow">How it Works</p>
          <h2 className="section-title">From message to fixed garment</h2>
        </div>

        <div className="how-it-works-grid">
          <ol className="how-it-works-steps">
            {steps.map((step, index) => (
              <li className="how-it-works-step" key={step.title}>
                <span className="how-it-works-number">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div
            className="whatsapp-mockup"
            aria-label="Example FixFit Assistant conversation"
          >
            <div className="whatsapp-header">
              <span className="whatsapp-active" aria-hidden="true" />
              <div>
                <strong>FixFit Assistant</strong>
                <span>Active now</span>
              </div>
            </div>
            <div className="whatsapp-messages">
              <p className="whatsapp-message outgoing">
                Zip broke on my blouse before a wedding 😭
              </p>
              <p className="whatsapp-message incoming">
                Got it! QuickFix — ₹350–₹599 · 2–3 hrs. Book Priya now?
              </p>
              <p className="whatsapp-message outgoing">
                Yes please, it&apos;s urgent!
              </p>
              <p className="whatsapp-message incoming">
                Priya is on her way 🧵 OTP: 4821 — share it at pickup
              </p>
              <p className="whatsapp-message incoming">
                Fixed &amp; QC passed ✅ Delivering now — pay only after you
                inspect it
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
