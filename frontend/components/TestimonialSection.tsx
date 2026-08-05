import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Aanya Sharma",
    location: "Delhi",
    text: "Travel Genie planned our Goa trip perfectly within budget. The AI understood exactly what we wanted without us filling any forms — just a natural conversation!",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Rohit Mehta",
    location: "Bangalore",
    text: "The itinerary for Kerala was spot on — houseboat, Fort Kochi heritage walk, Ayurvedic spa. And when flights were over budget, it suggested trains without pressuring us.",
    rating: 5,
    avatar: "R",
  },
  {
    name: "Priya Nair",
    location: "Mumbai",
    text: "I was skeptical about AI planning my Manali trip, but the day-by-day itinerary was incredibly detailed and realistic. Saved me hours of research!",
    rating: 5,
    avatar: "P",
  },
];

export default function TestimonialSection() {
  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {TESTIMONIALS.map((t, i) => (
        <div
          key={i}
          className="relative p-8 rounded-[var(--radius-lg)] transition-all hover:shadow-[var(--shadow-lg)]"
          style={{
            backgroundColor: "var(--color-white)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Quote
            size={36}
            style={{ color: "var(--color-accent)", opacity: 0.15 }}
            className="absolute top-6 right-6"
          />

          {/* Stars */}
          <div className="flex gap-1 mb-5">
            {Array.from({ length: t.rating }).map((_, si) => (
              <Star key={si} size={14} className="fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-secondary)" }}>
            &quot;{t.text}&quot;
          </p>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {t.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                {t.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {t.location}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
