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

    // Return focus to the hamburger after the drawer closes.
    requestAnimationFrame(() => {
      hamburgerRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    /*
     * Lock both html and body scrolling while the mobile drawer
     * is open. This prevents the landing page from moving behind
     * the drawer on mobile browsers.
     */
    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    // Move keyboard focus into the drawer.
    requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [open, close]);

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary">
        <Logo />

        {/* Desktop navigation */}
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

        {/* Desktop CTA */}
        <Link className="site-nav-cta" href={diagnoseHref}>
          Fix My Garment
        </Link>

        {/* Mobile hamburger */}
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

      {/* Mobile drawer */}
      <div
        className="site-drawer"
        data-open={open}
        id={drawerId}
        aria-hidden={!open}
      >
        {/* Dark backdrop */}
        <button
          type="button"
          className="site-drawer-backdrop"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={close}
        />

        {/* Drawer panel */}
        <div
          className="site-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            className="site-drawer-close"
            aria-label="Close menu"
            onClick={close}
          >
            ✕
          </button>

          {/* Navigation links */}
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

          {/* Drawer CTA */}
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
