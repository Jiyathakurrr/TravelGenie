import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import DestinationCard from "@/components/DestinationCard";
import TestimonialSection from "@/components/TestimonialSection";
import FAQAccordion from "@/components/FAQAccordion";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, ShieldCheck } from "lucide-react";
import type { Destination } from "@/types/chat";
import type { Metadata } from "next";
import destinationsData from "@/data/destinations.json";

export const metadata: Metadata = {
  title: "Travel Genie — Your AI-Powered Travel Companion",
  description:
    "Plan smarter trips with Travel Genie. AI-powered itineraries, budget-aware suggestions, and seamless booking.",
};

const WHY_US = [
  {
    icon: <Sparkles size={22} />,
    title: "AI-Crafted Itineraries",
    desc: "Conversational AI that listens to your needs and builds realistic day-by-day plans within your budget.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Curated Indian Destinations",
    desc: "From Goa's beaches to Manali's peaks — we know India's best experiences intimately.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Safe & Transparent",
    desc: "Real-time safety advisories and seasonal weather insights. No auto-booking — ever.",
  },
];

export default function HomePage() {
  const featured = (destinationsData as Destination[]).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* About teaser */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              About Travel Genie
            </span>
            <h2
              className="mt-4 text-4xl lg:text-5xl leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Travel planning,
              <br />
              <em>reinvented with AI</em>
            </h2>
            <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--color-secondary)" }}>
              Travel Genie is a university capstone project that reimagines how people plan trips. Through a warm,
              conversational AI interface, it gathers your destination, dates, and budget, then crafts a complete
              day-by-day itinerary — no forms, no friction.
            </p>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-secondary)" }}>
              It compares mock flights, hotels, and train options, flags budget overages honestly, and always
              requires your explicit confirmation before booking anything.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              Meet the team <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className="rounded-[var(--radius-xl)] overflow-hidden h-80 relative"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80&auto=format"
              alt="Travel planning"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--color-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
                Most Loved
              </span>
              <h2
                className="mt-2 text-4xl leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Popular Destinations
              </h2>
            </div>
            <Link
              href="/destinations"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((dest) => (
              <DestinationCard key={dest.slug} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Why Travel Genie
            </span>
            <h2 className="mt-2 text-4xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Travel smarter, not harder
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {WHY_US.map((item) => (
              <div key={item.title} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "var(--color-cream)", color: "var(--color-accent)" }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Traveller Stories
            </span>
            <h2 className="mt-2 text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              What travellers say
            </h2>
          </div>
          <TestimonialSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Got Questions?
            </span>
            <h2 className="mt-2 text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              Frequently asked
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="px-6 py-20 text-center"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        <h2 className="text-4xl mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
          Ready for your next adventure?
        </h2>
        <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
          Chat with Travel Genie and get a personalised itinerary in minutes.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:shadow-lg active:scale-95"
          style={{ backgroundColor: "var(--color-white)", color: "var(--color-accent)" }}
        >
          Start Planning <ArrowRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
