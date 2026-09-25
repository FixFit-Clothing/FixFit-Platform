import Link from "next/link";
import {
  companyLinks,
  legalLinks,
  primaryNav,
  serviceLinks,
} from "@/config/navigation";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-wrap footer-grid">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            FixFit
          </Link>
          <p>
            We launched in HSR Layout, Bengaluru, to perfect the fastest, safest
            way to fix women&apos;s clothing — before we take it anywhere else.
          </p>
        </div>
        <div className="footer-col">
          <h2 className="footer-col-title">Navigate</h2>
          {primaryNav.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-col">
          <h2 className="footer-col-title">Services</h2>
          {serviceLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="footer-col">
          <h2 className="footer-col-title">Company</h2>
          {companyLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
          <h2 className="footer-col-title footer-col-title-follow">Legal</h2>
          {legalLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="site-wrap footer-bottom">
        <p className="footer-tagline">
          Emergency tailor · Blouse &amp; garment alteration · Same-day fixes ·
          Zip repair · HSR Layout, Koramangala &amp; Indiranagar (soon) · © 2026
          FixFit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
