/**
 * components/Navbar.tsx
 *
 * Traavellio-style navigation bar.
 * - Logo (DM Serif Display), nav links, Login/Signup, "Plan a Trip" CTA
 * - Mobile hamburger with slide-down panel
 * - Auth state awareness via backend JWT / localStorage
 */
"use client";

import { useState, useEffect } from "react";
import { Menu, X, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function getAuthUser() {
      try {
        const token = localStorage.getItem("travelgenie_token");
        const storedUser = localStorage.getItem("travelgenie_user");
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Navbar auth check error:", err);
      }
    }
    getAuthUser();
  }, [pathname]);

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
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}
          >
            TravelGenie
          </span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-(--color-primary)"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/bookings"
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-black/5"
              style={{ color: "var(--color-primary)" }}
            >
              <UserIcon size={16} />
              <span>Bookings</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium px-3 py-1.5 transition-colors hover:text-(--color-primary)"
                style={{ color: "var(--color-muted)" }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium px-4 py-2 rounded-full border transition-all hover:bg-black/5"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                Sign Up
              </Link>
            </>
          )}

          <Link
            href="/plan"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Plan a Trip
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-black/5 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pt-4 pb-6 border-b shadow-lg animate-in slide-in-from-top duration-200"
          style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium py-2 transition-colors"
                style={{ color: pathname === link.href ? "var(--color-primary)" : "var(--color-muted)" }}
              >
                {link.label}
              </Link>
            ))}

            <hr style={{ borderColor: "var(--color-border)" }} />

            {user ? (
              <Link
                href="/bookings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-base font-medium py-2"
                style={{ color: "var(--color-primary)" }}
              >
                <UserIcon size={18} />
                <span>My Bookings</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium py-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium px-4 py-2 rounded-full border"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              href="/plan"
              onClick={() => setMobileOpen(false)}
              className="text-center font-semibold py-3 rounded-full text-white mt-2"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Plan a Trip
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
