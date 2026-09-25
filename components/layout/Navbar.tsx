"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { diagnoseHref, primaryNav } from "@/config/navigation";

function Logo({ className }: { className?: string }) {
  return (
    <Link href="/#home" className={className ?? "site-logo"}>
      FixFit
      <span className="site-logo-mark" aria-hidden="true">
        ✕
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary">
        <Logo />
        <div className="site-nav-links">
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link className="site-nav-cta" href={diagnoseHref}>
          Fix My Garment
        </Link>
        <button
          ref={hamburgerRef}
          type="button"
          className="site-hamburger"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div
        className="site-drawer"
        data-open={open}
        id={drawerId}
        inert={!open}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="site-drawer-backdrop"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={close}
        />
        <div
          className="site-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            ref={closeRef}
            type="button"
            className="site-drawer-close"
            aria-label="Close menu"
            onClick={close}
          >
            ✕
          </button>
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="site-nav-cta site-drawer-cta"
            href={diagnoseHref}
            onClick={close}
          >
            Fix My Garment
          </Link>
        </div>
      </div>
    </header>
  );
}
