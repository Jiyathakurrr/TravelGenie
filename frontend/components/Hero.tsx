/**
 * components/Hero.tsx
 *
 * Traavellio-style full-bleed hero with large editorial headline,
 * atmospheric background gradient, and a prominent CTA.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative flex items-center justify-center min-h-screen px-6 overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, rgba(3,61,74,0.65) 0%, rgba(3,61,74,0.3) 50%, rgba(250,248,240,1) 100%),
          url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80&auto=format') center/cover no-repeat
        `,
      }}
    >
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "var(--color-white)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            AI-Powered Travel Planning
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
          className="text-5xl sm:text-6xl lg:text-7xl mb-6 leading-[1.1] text-balance"
        >
          Discover the World,
          <br />
          <span style={{ fontStyle: "italic" }}>Intelligently Planned</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)" }}
        >
          Travel Genie crafts personalised, budget-aware itineraries through
          a warm conversational experience — powered by AI, designed for you.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold
                       transition-all duration-200 hover:shadow-[var(--shadow-lg)] active:scale-95"
            style={{
              backgroundColor: "var(--color-white)",
              color: "var(--color-accent)",
              fontFamily: "var(--font-body)",
            }}
          >
            Start Planning
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold
                       transition-all duration-200 hover:bg-white/10 active:scale-95"
            style={{
              color: "var(--color-white)",
              border: "1px solid rgba(255,255,255,0.35)",
              fontFamily: "var(--font-body)",
            }}
          >
            Explore Destinations
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex items-center justify-center gap-12 flex-wrap">
          {[
            { value: "500+", label: "Trips Planned" },
            { value: "50+", label: "Destinations" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold" style={{ color: "var(--color-white)", fontFamily: "var(--font-display)" }}>
                {stat.value}
              </p>
              <p className="text-xs mt-1 tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div
          className="w-6 h-10 rounded-full border-2 flex justify-center pt-2"
          style={{ borderColor: "rgba(255,255,255,0.3)" }}
        >
          <div
            className="w-1 h-2.5 rounded-full animate-bounce"
            style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
          />
        </div>
      </div>
    </section>
  );
}
