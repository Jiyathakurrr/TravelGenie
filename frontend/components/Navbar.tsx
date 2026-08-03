/**
 * components/Navbar.tsx
 * Top navigation bar — clean and minimal, echoing MakeMyTrip's category structure.
 */
"use client";

import { useState } from "react";
import { Menu, X, Plane } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/chat", label: "Plan a Trip" },
  { href: "/bookings", label: "My Bookings" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        boxShadow: "0 1px 0 var(--color-sand-dark)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            style={{
              backgroundColor: "var(--color-terra)",
              color: "var(--color-sand)",
            }}
            className="rounded-lg p-1.5 transition-all group-hover:scale-110"
          >
            <Plane size={18} />
          </span>
          <span
            style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)" }}
            className="text-xl font-bold tracking-tight"
          >
            TravelGenie
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color:
                  pathname === link.href
                    ? "var(--color-terra)"
                    : "var(--color-ink-muted)",
                fontWeight: pathname === link.href ? 600 : 400,
              }}
              className="text-sm transition-colors hover:text-[var(--color-terra)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            style={{
              backgroundColor: "var(--color-terra)",
              color: "var(--color-sand)",
              fontFamily: "var(--font-body)",
            }}
            className="px-5 py-2 rounded-[var(--radius-btn)] text-sm font-semibold
                       transition-all hover:bg-[var(--color-terra-dark)] hover:shadow-md
                       active:scale-95"
          >
            Start Planning
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          style={{ color: "var(--color-terra)" }}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div
          style={{ backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-sand-dark)" }}
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: "var(--color-ink)" }}
              className="text-sm font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            style={{ backgroundColor: "var(--color-terra)", color: "var(--color-sand)" }}
            className="px-5 py-2 rounded-[var(--radius-btn)] text-sm font-semibold text-center"
            onClick={() => setMobileOpen(false)}
          >
            Start Planning
          </Link>
        </div>
      )}
    </header>
  );
}
