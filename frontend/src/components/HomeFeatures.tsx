import React from 'react';
import { Sparkles, MapPin, ShieldCheck } from 'lucide-react';

export const HomeFeatures: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Crafted Itineraries',
      desc: 'Smart algorithms match your timeline, group dynamics, and preferred travel pace to produce hour-by-hour route blueprints.',
    },
    {
      icon: MapPin,
      title: 'Based in Mumbai, Serving Pan-India',
      desc: 'From Kashmir to Kanyakumari, explore 430+ catalogued Indian destinations with genuine local context and transit schedules.',
    },
    {
      icon: ShieldCheck,
      title: 'Safe & Transparent',
      desc: 'Transparent budget projections in INR, verified accommodations, and government safety advisories directly from our database.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
            Why TravelGenie
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-primary)]">
            Travel smarter, not harder
          </h2>
          <p className="mt-3 text-sm text-[var(--color-secondary)]">
            Designed to remove the friction of travel planning across diverse Indian terrains, seasons, and budgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] text-amber-300 flex items-center justify-center mb-6 shadow-xs">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold font-serif text-[var(--color-primary)] mb-3">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-secondary)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
