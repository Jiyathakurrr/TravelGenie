/**
 * components/Footer.tsx
 *
 * Traavellio-style footer with dark teal background, marquee tagline,
 * multi-column links, and a clean bottom bar.
 */
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/plan", label: "Plan a Trip" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
];

const DESTINATIONS = [
  { href: "/destinations#goa", label: "Goa" },
  { href: "/destinations#manali", label: "Manali" },
  { href: "/destinations#kerala", label: "Kerala" },
  { href: "/destinations#jaipur", label: "Jaipur" },
  { href: "/destinations#udaipur", label: "Udaipur" },
];

export default function Footer() {
  const tagline = "Your AI-Powered Travel Companion · ";
  const repeated = tagline.repeat(8);

  return (
    <footer style={{ backgroundColor: "var(--color-accent)" }} className="text-white">
      {/* Marquee */}
      <div className="overflow-hidden py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="animate-marquee whitespace-nowrap flex">
          <span
            style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.3)" }}
            className="text-3xl tracking-wide"
          >
            {repeated}
          </span>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xl mb-4"
            >
              Travel Genie
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              An AI-powered travel planning platform that crafts personalised itineraries,
              compares options within your budget, and makes booking seamless.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              Destinations
            </h4>
            <ul className="space-y-2.5">
              {DESTINATIONS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>University Capstone Project<br />India</span>
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <Mail size={16} className="shrink-0" />
                <span>team@travelgenie.dev</span>
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <Phone size={16} className="shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="py-5 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 Travel Genie · MIT License · A University Capstone Project
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Powered by Kimi AI · Payments via Razorpay Test Mode only
          </p>
        </div>
      </div>
    </footer>
  );
}
