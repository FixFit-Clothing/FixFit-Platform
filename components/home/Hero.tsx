import Link from "next/link";
import { HeroProof } from "@/components/home/HeroProof";
import { HeroVisual } from "@/components/home/HeroVisual";
import { diagnoseHref, pricingHref } from "@/config/navigation";

export function Hero() {
  return (
    <section className="hero">
      <div className="site-wrap hero-grid">
        <div className="hero-enter">
          <p className="hero-eyebrow">HSR Layout, Bengaluru</p>
          <h1 className="hero-title">
            Your clothing
            <br />
            <em>emergency</em>, solved
            <br />
            at your door.
          </h1>
          <p className="hero-sub">
            A torn seam before the wedding. A blouse that needs fitting before
            Friday. FixFit sends a verified female executive to fix it — urgent
            or planned, your call.
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary" href={diagnoseHref}>
              Diagnose My Fix
            </Link>
            <Link className="btn-ghost" href={pricingHref}>
              Browse Prices
            </Link>
          </div>
          <HeroProof />
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
