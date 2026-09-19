import React, { useState, useEffect } from 'react';
import { Clock, Wallet, Check, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { TravelPackage, ItineraryTemplate } from '../types';
import { CloudinaryImage } from './CloudinaryImage';

interface PackagesSectionProps {
  onPlanTrip: (destinationOrTheme: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({ onPlanTrip }) => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'packages' | 'itineraries'>('packages');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/packages').then((res) => res.json()),
      fetch('/api/itineraries').then((res) => res.json()),
    ])
      .then(([pkgData, itinData]) => {
        if (Array.isArray(pkgData)) setPackages(pkgData);
        if (Array.isArray(itinData)) setItineraries(itinData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching packages/itineraries:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="packages" className="py-20 px-4 sm:px-6 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
            Curated Expeditions
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-primary)]">
            Tailored Packages & AI Itineraries
          </h2>
          <p className="mt-3 text-sm text-[var(--color-secondary)]">
            Handcrafted travel plans backed by comprehensive itinerary templates and real-time cost estimations.
          </p>

          {/* Toggle Tab */}
          <div className="mt-6 inline-flex p-1 rounded-full bg-white border border-[var(--color-border)] shadow-sm">
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'packages'
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
              }`}
            >
              Travel Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('itineraries')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'itineraries'
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
              }`}
            >
              Itinerary Blueprints ({itineraries.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[var(--color-secondary)]">
            Loading curated travel packages...
          </div>
        ) : activeTab === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-gray-100">
                    <CloudinaryImage
                      images={pkg.images}
                      category="scenic"
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                      {pkg.budgetCategory ? pkg.budgetCategory.toUpperCase() : 'STANDARD'}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[var(--color-accent)] shadow-sm flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>{pkg.durationDays} Days / {pkg.durationDays - 1} Nights</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold font-serif text-[var(--color-primary)] tracking-tight">
                      {pkg.title}
                    </h3>

                    {/* Price Range */}
                    <div className="mt-3 flex items-baseline gap-1 text-[var(--color-accent)]">
                      <span className="text-xs text-[var(--color-muted)] font-medium">From</span>
                      <span className="text-xl font-bold">₹{pkg.price?.min?.toLocaleString() || '12,000'}</span>
                      <span className="text-xs text-[var(--color-muted)] font-medium">to ₹{pkg.price?.max?.toLocaleString() || '25,000'}</span>
                    </div>

                    {/* Inclusions */}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div className="mt-5 space-y-1.5 border-t border-[var(--color-border)] pt-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                          Includes:
                        </span>
                        {pkg.inclusions.slice(0, 3).map((inc, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-secondary)]">
                            <Check size={13} className="text-emerald-500 shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onPlanTrip(pkg.title)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[var(--color-accent)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <span>Customize Itinerary</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itineraries.map((itin) => (
              <div
                key={itin._id}
                className="bg-white rounded-2xl p-6 border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-accent)] font-semibold border border-[var(--color-border)]">
                      {itin.theme || 'Exploration'}
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-secondary)] flex items-center gap-1">
                      <Clock size={13} />
                      {itin.durationDays} Days
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-[var(--color-primary)] mt-3">
                    {itin.title}
                  </h3>

                  <div className="mt-4 p-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-secondary)]">Daily Budget:</span>
                      <span className="font-bold text-[var(--color-accent)]">₹{itin.estimatedDailyBudget?.toLocaleString() || '1,800'}/day</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-[var(--color-secondary)]">Est. Total Cost:</span>
                      <span className="font-bold text-emerald-700">₹{itin.estimatedTotalCost?.toLocaleString() || '9,000'}</span>
                    </div>
                  </div>

                  {/* Day breakdown preview */}
                  {itin.days && (
                    <div className="mt-4 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Day-by-Day Highlight:
                      </span>
                      {itin.days.slice(0, 3).map((day, idx) => (
                        <div key={idx} className="text-xs text-[var(--color-secondary)] flex items-start gap-2">
                          <span className="font-bold text-[var(--color-accent)] shrink-0">Day {day.dayNumber}:</span>
                          <span className="truncate">{day.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => onPlanTrip(itin.title)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-surface)] hover:bg-[var(--color-cream)] border border-[var(--color-border)] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Load Into Planner</span>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
