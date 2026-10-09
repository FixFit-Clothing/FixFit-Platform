import Link from "next/link";

const verificationSteps = [
  "Verify her ID",
  "Garment photographed",
  "Garment collected",
  "Fix supervised",
  "10-point QC",
  "You inspect before payment",
];

export function VerificationCTA() {
  return (
    <section className="home-section home-section-tight">
      <div className="site-wrap">
        <div className="section-head">
          <p className="section-eyebrow">Your FixFit Style Executive</p>
          <h2 className="section-title">
            Verified. Trained. Identifiable. Accountable.
          </h2>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {verificationSteps.map((step, index) => (
            <li className="text-center" key={step}>
              <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary bg-background font-serif text-2xl font-bold leading-none text-primary shadow-sm">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold leading-snug text-secondary">
                {step}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Link className="btn-ghost" href="/why-trust-us">
            See our full verification system →
          </Link>
        </div>
      </div>
    </section>
  );
}
