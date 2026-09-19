import React from 'react';
import { Sparkles, Compass, ShieldCheck, IndianRupee, ArrowRight } from 'lucide-react';

interface HomeHeroProps {
  onPlanTrip: () => void;
  onExploreDestinations: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onPlanTrip, onExploreDestinations }) => {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 bg-[var(--color-cream)] border-b border-[var(--color-border)]">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--color-border)] shadow-xs mb-8">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-xs font-semibold tracking-wide text-[var(--color-accent)]">
            Pan-India AI Trip Companion · Verified Travel Intelligence
          </span>
        </div>

        {/* Hero Headline matching Traavellio */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[var(--color-primary)] tracking-tight leading-[1.1]">
          Discover the World,<br />
          <span className="italic font-normal text-[var(--color-accent)]">Intelligently Planned</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[var(--color-secondary)] max-w-2xl mx-auto leading-relaxed">
          Custom itineraries crafted around your budget in INR, travel style, and timeline. Grounded in real-time destination, hotel, and safety intelligence across India.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPlanTrip}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-[var(--color-accent)] hover:opacity-95 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>Start Planning Free</span>
          </button>
          <button
            onClick={onExploreDestinations}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold text-[var(--color-primary)] bg-white hover:bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Destinations</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-primary)]">
              430+
            </span>
            <span className="text-xs text-[var(--color-secondary)] mt-1 font-medium">
              Verified Destinations Catalog
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-primary)]">
              100% INR
            </span>
            <span className="text-xs text-[var(--color-secondary)] mt-1 font-medium">
              Real Estimated Daily Budgets
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-primary)]">
              24/7 AI
            </span>
            <span className="text-xs text-[var(--color-secondary)] mt-1 font-medium">
              Grounded Route & Safety Concierge
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
