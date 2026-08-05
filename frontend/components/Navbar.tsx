/**
 * components/Navbar.tsx
 *
 * Traavellio-style navigation bar.
 * - Transparent on top, cream/white bg on scroll
 * - Logo (DM Serif Display), nav links, "Plan a Trip" CTA
 * - Mobile hamburger with slide-down panel
 */
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(250, 248, 240, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span
            style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
            className="text-2xl tracking-tight"
          >
            Travel Genie
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{
                fontFamily: "var(--font-body)",
                color: pathname === link.href
                  ? "var(--color-accent)"
                  : "var(--color-secondary)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => {
                if (pathname !== link.href) e.currentTarget.style.color = "var(--color-secondary)";
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* CTA Button */}
          <Link
            href="/plan"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-white)",
              fontFamily: "var(--font-body)",
            }}
            className="px-6 py-2.5 rounded-full text-sm font-semibold
                       transition-all duration-200 hover:opacity-90 hover:shadow-[var(--shadow-md)]
                       active:scale-95"
          >
            Plan a Trip
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2"
          style={{ color: "var(--color-primary)" }}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div
          style={{
            backgroundColor: "var(--color-cream)",
            borderBottom: "1px solid var(--color-border)",
          }}
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-1"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium py-3"
              style={{
                color: pathname === link.href
                  ? "var(--color-accent)"
                  : "var(--color-primary)",
                borderBottom: "1px solid var(--color-border)",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/plan"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-white)",
            }}
            className="px-6 py-3 rounded-full text-sm font-semibold text-center mt-3"
            onClick={() => setMobileOpen(false)}
          >
            Plan a Trip
          </Link>
        </div>
      )}
    </header>
  );
}
