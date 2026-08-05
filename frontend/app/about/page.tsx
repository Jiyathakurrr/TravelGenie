import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Travel Genie",
  description: "Learn about the Travel Genie team — a university capstone project built with AI.",
};

const TEAM = [
  {
    name: "Jiya Thakur",
    role: "Developer & Tester",
    desc: "Leads the frontend build, API integration, and quality assurance across all modules.",
    emoji: "👩‍💻",
  },
  {
    name: "Prachi",
    role: "Product Manager & Research Coordinator",
    desc: "Defines the product vision, conducts user research, and coordinates project timelines.",
    emoji: "📋",
  },
  {
    name: "Hitanshi",
    role: "System Designer & Deployer",
    desc: "Designs the system architecture, manages Vercel deployment, and environment configuration.",
    emoji: "🏗️",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="px-6 py-20 text-center" style={{ backgroundColor: "var(--color-cream)" }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
            Our Story
          </span>
          <h1 className="mt-3 text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            About Travel Genie
          </h1>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "var(--color-secondary)" }}>
            Travel Genie is a university end-semester capstone project that reimagines travel planning through
            conversational AI — making expert-level itinerary planning accessible to everyone.
          </p>
        </section>

        {/* Mission */}
        <section className="px-6 py-20" style={{ backgroundColor: "var(--color-white)" }}>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
                Why we built this
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-secondary)" }}>
                Planning a trip is time-consuming and overwhelming — comparing prices, checking safety, finding
                the right hotels, staying on budget. We built Travel Genie to collapse all of that into a
                single conversation.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                Powered by Kimi AI (Moonshot AI) and built on a zero-cost tech stack (Supabase, Vercel Hobby,
                Razorpay Test Mode), Travel Genie is proof that sophisticated AI products can be built lean.
              </p>
            </div>
            <div
              className="rounded-[var(--radius-xl)] overflow-hidden h-72"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80&auto=format"
                alt="Team planning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="px-6 py-20" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                Meet the team
              </h2>
              <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
                3 students, 1 semester, 1 AI travel product
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="p-8 rounded-[var(--radius-lg)] text-center"
                  style={{ backgroundColor: "var(--color-white)", border: "1px solid var(--color-border)" }}
                >
                  <div className="text-5xl mb-4">{member.emoji}</div>
                  <h3 className="text-xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {member.name}
                  </h3>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {member.role}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                    {member.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack note */}
        <section className="px-6 py-16" style={{ backgroundColor: "var(--color-white)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Built on a zero-cost stack
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["Next.js 14", "Tailwind CSS", "TypeScript", "Kimi AI", "Supabase", "Razorpay (Test)", "Vercel Hobby"].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)", border: "1px solid var(--color-border)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
