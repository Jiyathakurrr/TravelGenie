import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Travel Genie",
  description: "Travel tips, destination guides, and itinerary inspiration from Team Travel Genie.",
};

const POSTS = [
  {
    slug: "goa-offseason-guide",
    title: "Goa in the Monsoon: Why Off-Season is Actually Perfect",
    excerpt:
      "Skip the crowds and soaring prices. Goa in June–September offers lush green landscapes, empty beaches, and 50% cheaper stays — if you know where to go.",
    category: "Destination Guide",
    readTime: "5 min read",
    date: "July 2026",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80&auto=format",
    author: "Prachi",
  },
  {
    slug: "manali-budget-itinerary",
    title: "Manali on ₹15,000 for 5 Days: The Budget Traveller's Playbook",
    excerpt:
      "From Solang Valley to the Rohtang Pass, a complete 5-day budget itinerary for Manali — accommodation picks, food tips, and how to avoid tourist traps.",
    category: "Budget Travel",
    readTime: "7 min read",
    date: "June 2026",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80&auto=format",
    author: "Hitanshi",
  },
  {
    slug: "ai-trip-planning",
    title: "How We Built an AI Travel Planner for Our Capstone Project",
    excerpt:
      "Behind the scenes of building Travel Genie — from choosing Kimi AI to structuring conversational trip data collection and generating JSON itineraries at scale.",
    category: "Behind the Build",
    readTime: "10 min read",
    date: "August 2026",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80&auto=format",
    author: "Jiya",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="px-6 py-16" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="max-w-7xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Travel Journal
            </span>
            <h1 className="mt-3 text-5xl" style={{ fontFamily: "var(--font-display)" }}>
              Stories & Guides
            </h1>
          </div>
        </section>

        {/* Posts */}
        <section className="px-6 py-16" style={{ backgroundColor: "var(--color-white)" }}>
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="group rounded-[var(--radius-lg)] overflow-hidden transition-all hover:shadow-[var(--shadow-lg)]"
                style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-cream)" }}
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "var(--color-surface)", color: "var(--color-accent)" }}
                    >
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                  <h2
                    className="text-xl mb-3 leading-snug group-hover:text-[var(--color-accent)] transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: "var(--color-secondary)" }}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                      By {post.author} · {post.date}
                    </span>
                    <ArrowUpRight size={18} style={{ color: "var(--color-accent)" }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
