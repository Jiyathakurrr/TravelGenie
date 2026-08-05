import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DestinationCard from "@/components/DestinationCard";
import type { Destination } from "@/types/chat";
import type { Metadata } from "next";
import destinationsData from "@/data/destinations.json";

export const metadata: Metadata = {
  title: "Destinations — Travel Genie",
  description: "Explore handpicked Indian destinations. From Goa beaches to Himalayan peaks.",
};

const EXPERIENCES = [
  "All", "Beaches", "Mountains", "Heritage", "Adventure", "Wellness", "Nature",
];

export default function DestinationsPage() {
  const destinations = destinationsData as Destination[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="px-6 py-16 text-center" style={{ backgroundColor: "var(--color-cream)" }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
            Explore India
          </span>
          <h1 className="mt-3 text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            Our Destinations
          </h1>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "var(--color-secondary)" }}>
            From sun-kissed beaches to snow-capped peaks — handpicked destinations with AI-crafted itineraries.
          </p>
        </section>

        {/* Filter Pills */}
        <section className="px-6 py-6" style={{ backgroundColor: "var(--color-white)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {EXPERIENCES.map((exp) => (
              <button
                key={exp}
                className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: exp === "All" ? "var(--color-accent)" : "var(--color-surface)",
                  color: exp === "All" ? "white" : "var(--color-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {exp}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="px-6 py-16" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <DestinationCard key={dest.slug} destination={dest} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
