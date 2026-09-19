import Link from "next/link";

import { Container } from "../ui/Container/Container";

export function Footer() {
  return (
    <footer>
      <Container>
        <div className="py-8">
          <Link href="/" aria-label="FixFit home">
            FixFit
          </Link>

          <p className="mt-2">
            On-demand clothing emergency service.
          </p>

          <p className="mt-4">
            © {new Date().getFullYear()} FixFit. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}