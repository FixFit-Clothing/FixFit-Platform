import Link from "next/link";

type Fix = {
  id: string;
  title: string;
  description: string;
};

// Mirrors the complete FIX_CATALOG in the supplied FixFit reference page.
const fixes: Fix[] = [
  {
    id: "broken-zip-repair",
    title: "Broken Zip Repair",
    description: "Zip replacement, HSR Layout — from ₹299, same-day.",
  },
  {
    id: "blouse-alteration",
    title: "Blouse Alteration",
    description: "Fit, sleeve, hook & fall — from ₹599.",
  },
  {
    id: "dress-alteration",
    title: "Dress Alteration",
    description: "Take in, let out, hem — from ₹499.",
  },
  {
    id: "gown-lehenga-alteration",
    title: "Gown & Lehenga Alteration",
    description: "Fall, edging, fitting — from ₹349.",
  },
  {
    id: "torn-seam-repair",
    title: "Torn Seam Repair",
    description: "Invisible mending, any fabric — from ₹149.",
  },
  {
    id: "sleeve-shortening",
    title: "Sleeve Shortening",
    description: "Precise length matching — from ₹199.",
  },
  {
    id: "waist-adjustment",
    title: "Waist Adjustment",
    description: "Trousers, salwar, skirts — from ₹249.",
  },
  {
    id: "hook-button-repair",
    title: "Hook/Button Repair",
    description: "Any garment, on the spot — from ₹99.",
  },
  {
    id: "same-day-alteration",
    title: "Same-Day Alteration",
    description: "Scheduled, no rush — book ahead in HSR Layout.",
  },
  {
    id: "emergency-tailor-hsr-layout",
    title: "Emergency Tailor, HSR Layout",
    description: "Verified female executive at your door in ~12 min.",
  },
  {
    id: "womens-tailor",
    title: "Women’s Tailor",
    description: "Always a female Style Executive — by design, not marketing.",
  },
  {
    id: "tailor-near-me-hsr-layout",
    title: "Tailor Near Me — HSR Layout",
    description: "Skip the shop visit. We come to you, all 7 sectors.",
  },
];

function GarmentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="7" r="3" />
      <path d="m32 10-9 8h-8l-5 11 9 5v26h26V34l9-5-5-11h-8z" />
    </svg>
  );
}

export function AllFixes() {
  return (
    <main className="all-fixes-page">
      <section
        className="site-wrap all-fixes-section"
        aria-labelledby="all-fixes-title"
      >
        <header className="section-head all-fixes-header">
          <p className="section-eyebrow">HSR Layout&apos;s emergency tailor</p>
          <h1 className="section-title" id="all-fixes-title">
            Every fix we handle, by name.
          </h1>
        </header>
        <p className="all-fixes-intro">Choose a fix to start your estimate.</p>
        <div className="all-fixes-grid">
          {fixes.map((fix) => (
            <article className="all-fixes-card" key={fix.id}>
              <div className="all-fixes-image" aria-hidden="true">
                <GarmentIcon />
                <span>Reference image — coming soon</span>
              </div>
              <div className="all-fixes-card-body">
                <h2>{fix.title}</h2>
                <p>{fix.description}</p>
                <Link
                  className="all-fixes-cta"
                  href="/estimator"
                  aria-label={`Book ${fix.title}`}
                >
                  Book Now <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
