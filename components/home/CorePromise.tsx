const promiseSteps = [
  {
    title: "Send",
    description: "WhatsApp or app · instant quote",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m21 3-7.4 18-3.2-7.2L3 10.6 21 3Z" />
        <path d="m10.4 13.8 4.2-4.2" />
      </svg>
    ),
  },
  {
    title: "Pickup",
    description: "~12 min average",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h3l3 3v4h-6" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: "Fix",
    description: "~48 min average",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m14.7 6.3 3-3 3 3-3 3" />
        <path d="m16.2 4.8-8.9 8.9" />
        <path d="m5.8 11.6-2.5 2.5 6.6 6.6 2.5-2.5" />
        <path d="m4.9 19.1 2-2" />
      </svg>
    ),
  },
  {
    title: "QC",
    description: "10-point checklist",
    done: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12 4.2 4.2L19 6.5" />
      </svg>
    ),
  },
  {
    title: "Delivery",
    description: "You inspect, then pay",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" />
        <path d="M8 10h8" />
        <path d="M12 6v12" />
      </svg>
    ),
  },
];

export function CorePromise() {
  return (
    <section className="home-section home-section-tight">
      <div className="site-wrap">
        <div className="promise-card">
          <div className="section-head promise-heading">
            <p className="section-eyebrow">Our core promise</p>
            <h2 className="section-title">
              Your clothing emergency, solved in 2 hours.
            </h2>
          </div>

          <div className="promise-row">
            {promiseSteps.map((step) => (
              <div
                className={`promise-step${step.done ? " done" : ""}`}
                key={step.title}
              >
                <div className="promise-num">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <p className="promise-note">
            Illustrative stage breakdown from our HSR Layout pilot (avg. total
            turnaround ≈1h 32m). We&apos;ll replace this with live, measured
            data as order volume grows.
          </p>
        </div>
      </div>
    </section>
  );
}
