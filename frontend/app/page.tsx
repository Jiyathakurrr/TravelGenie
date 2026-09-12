import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import TestimonialSection from "@/components/TestimonialSection";
import FAQAccordion from "@/components/FAQAccordion";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, ShieldCheck, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Genie — Your AI-Powered Travel Companion (Mumbai, India)",
  description:
    "Plan smarter trips across India with Travel Genie. AI-powered itineraries, budget-aware suggestions, and seamless booking.",
};

const WHY_US = [
  {
    icon: <Sparkles size={22} />,
    title: "AI-Crafted Itineraries",
    desc: "Conversational AI that listens to your needs and builds realistic day-by-day plans within your budget.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Based in Mumbai, Serving Pan-India",
    desc: "From Goa's beaches to Manali's peaks — curated experiences across all major Indian cities.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Safe & Transparent",
    desc: "Real-time safety advisories and seasonal weather insights. No auto-booking — ever.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Why Us Section */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Why Travel Genie
            </span>
            <h2 className="mt-2 text-4xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Travel smarter, not harder
            </h2>
            <p className="mt-3 text-sm text-gray-600 flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> Mumbai, Maharashtra</span>
              <span className="inline-flex items-center gap-1"><Mail size={14} /> travelgenie@gmail.com</span>
            </p>
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
          Chat with Travel Genie in Mumbai and get a personalised itinerary in minutes.
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
