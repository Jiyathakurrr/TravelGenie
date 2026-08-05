import Link from "next/link";
import { Star, MapPin, ArrowUpRight } from "lucide-react";
import type { Destination } from "@/types/chat";

interface Props {
  destination: Destination;
}

export default function DestinationCard({ destination }: Props) {
  return (
    <div
      className="group relative rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-xl)] hover:-translate-y-1"
      style={{
        backgroundColor: "var(--color-white)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Image container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Rating badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-sm">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{destination.rating}</span>
          <span className="text-gray-400">({destination.reviewCount})</span>
        </div>

        {/* Location tag */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
          <MapPin size={13} />
          <span>{destination.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-normal mb-2 text-gray-900 group-hover:text-[var(--color-accent)] transition-colors"
        >
          {destination.name}
        </h3>
        <p className="text-xs font-medium tracking-wide text-emerald-800 uppercase mb-3">
          {destination.tagline}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {destination.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {destination.experiences.slice(0, 3).map((exp) => (
            <span
              key={exp}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--color-surface)] text-gray-700 font-medium"
            >
              {exp}
            </span>
          ))}
        </div>

        {/* Price & Link */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <div>
            <span className="text-xs text-gray-500 block">Starting from</span>
            <span className="text-lg font-bold text-[var(--color-accent)]">
              ₹{destination.startingPriceINR.toLocaleString("en-IN")}
            </span>
          </div>

          <Link
            href={`/plan?destination=${encodeURIComponent(destination.name)}`}
            className="w-10 h-10 rounded-full bg-[var(--color-cream)] group-hover:bg-[var(--color-accent)] group-hover:text-white flex items-center justify-center transition-all"
            aria-label={`Plan trip to ${destination.name}`}
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
