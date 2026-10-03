const testimonials = [
  {
    quote:
      "My blouse zip broke two hours before a wedding. Priya was at my door in 15 minutes and it was fixed and back before I had to leave.",
    name: "Ananya R.",
    detail: "HSR Layout, Sector 3",
  },
  {
    quote:
      "I booked a ScheduleFix for my lehenga three weeks before the event, no rush at all. The fitting was better than what my usual tailor does.",
    name: "Meghana S.",
    detail: "HSR Layout, Sector 2",
  },
  {
    quote:
      "What sold me was seeing Priya's ID before I opened the door. Never thought I'd hand over a saree to someone I met five minutes ago, but it worked.",
    name: "Kavya N.",
    detail: "HSR Layout, Sector 5",
  },
];

export function CustomerTestimonials() {
  return (
    <section className="home-section home-section-tight">
      <div className="site-wrap">
        <div className="section-head testimonials-heading">
          <p className="section-eyebrow">What customers say</p>
          <h2 className="section-title">47 orders in, and counting.</h2>
        </div>

        <div className="cards3">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <p className="testimonial-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <blockquote>“{testimonial.quote}”</blockquote>
              <footer>
                <cite>{testimonial.name}</cite>
                <p>{testimonial.detail}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
