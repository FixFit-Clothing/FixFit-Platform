const trustItems = [
  {
    title: "Verified ID",
    description:
      "Every executive carries a checkable ID — see it before you open the door.",
  },
  {
    title: "Redo Guarantee",
    description: "Not right? We redo it free. Fabric damage is covered.",
  },
  {
    title: "Balance on Delivery",
    description: "Just ₹99 to book. Inspect the fix, then pay the rest.",
  },
  {
    title: "Founder Direct",
    description: "No support tickets — Arbaz calls you back within the hour.",
  },
];

export function TrustBanner() {
  return (
    <section className="trust-band">
      <div className="site-wrap trust-grid4">
        {trustItems.map((item) => (
          <div className="trust-item" key={item.title}>
            <h2 className="n">{item.title}</h2>
            <p className="d">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
