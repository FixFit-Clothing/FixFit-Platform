const guarantees = [
  {
    title: "No extra charge",
    description: "Any redo on our error costs you nothing.",
  },
  {
    title: "QC before delivery",
    description: "Every fix passes a 10-point check first.",
  },
  {
    title: "You inspect first",
    description: "Payment happens only after you're satisfied.",
  },
  {
    title: "Redo if necessary",
    description: "Not happy on inspection? We take it back and redo it.",
  },
];

export function FixFitGuarantee() {
  return (
    <section className="home-section home-section-tight">
      <div className="site-wrap">
        <div className="guarantee-band">
          <div className="guarantee-head">
            <p className="eyebrow2">The FixFit Guarantee</p>
            <h2>Not right? We fix it again — no arguments.</h2>
          </div>

          <div className="guarantee-grid4">
            {guarantees.map((guarantee) => (
              <div className="guarantee-item" key={guarantee.title}>
                <h3 className="t">{guarantee.title}</h3>
                <p className="d">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
