import Link from "next/link";

import { Container } from "../ui/Container/Container";

export function Navbar() {
  return (
    <header>
      <Container>
        <nav className="flex items-center justify-between py-4">
          <Link href="/" aria-label="FixFit home">
            FixFit
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/">Home</Link>
            <Link href="#how-it-works">All Fixes</Link>
            <Link href="#how-it-works">How It Works</Link>

            <Link href="#faq">FAQ</Link>
          </div>

          <Link href="#booking">Book Now</Link>
        </nav>
      </Container>
    </header>
  );
}