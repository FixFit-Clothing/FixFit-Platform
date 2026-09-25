import Link from "next/link";
import { resultsHref } from "@/config/navigation";

export function HeroProof() {
  return (
    <>
      <div className="hero-proof">
        <div className="proof-item">
          <strong>4.9★</strong> pilot rating
        </div>
        <div className="proof-item">
          <strong>47</strong> orders completed
        </div>
        <div className="proof-item">
          <strong>100%</strong> verified executives
        </div>
      </div>
      <div className="hero-proof-note">
        <Link className="proof-link" href={resultsHref}>
          Pilot-phase numbers from our first HSR Layout cohort — updated live as
          we scale. See real orders →
        </Link>
      </div>
    </>
  );
}
