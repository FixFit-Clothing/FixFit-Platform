"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { diagnoseHref, primaryNav } from "@/config/navigation";

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={className ?? "site-logo"}
      aria-label="FixFit home"
    >
      <Image
        src="/brand/fixfit-navbar.webp"
        alt="FixFit"
        width={360}
        height={180}
        priority
        unoptimized
        className="site-logo-image"
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const drawerId = useId();

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      // Keep keyboard focus on the control that opened the dialog. Do not do
      // this after following a link, as it can interfere with the new route's
      // normal scroll position.
      requestAnimationFrame(() => {
        hamburgerRef.current?.focus({ preventScroll: true });
      });
    }
  }, []);

  const handleHomeClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      // Next.js Link handles route changes. When already on the canonical home
      // route, scroll to its start without adding a history entry or fragment.
      if (pathname === "/" && window.location.hash === "") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname]
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close(true);
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
    <>
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
                onClick={item.href === "/" ? handleHomeClick : undefined}
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
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/*
       * Keep the fixed drawer outside the filtered sticky header. A
       * `backdrop-filter` ancestor becomes the containing block for fixed
       * descendants on mobile browsers, which otherwise limits this overlay to
       * the header instead of the viewport.
       */}
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
          onClick={() => close(true)}
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
            onClick={() => close(true)}
          >
            ✕
          </button>

          {/* Navigation links */}
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              onClick={(event) => {
                if (item.href === "/") handleHomeClick(event);
                close();
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Drawer CTA */}
          <Link
            className="site-nav-cta site-drawer-cta"
            href={diagnoseHref}
            onClick={() => close()}
          >
            Fix My Garment
          </Link>
        </div>
      </div>
    </>
  );
}
