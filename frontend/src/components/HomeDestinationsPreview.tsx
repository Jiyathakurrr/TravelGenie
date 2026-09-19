import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Destination } from '../types';
import { DestinationCard } from './DestinationCard';
import { DestinationDetailModal } from './DestinationDetailModal';

interface HomeDestinationsPreviewProps {
  onViewAll: () => void;
  onPlanTrip: (name: string) => void;
}

export const HomeDestinationsPreview: React.FC<HomeDestinationsPreviewProps> = ({
  onViewAll,
  onPlanTrip,
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'hill_station', label: 'Mountains' },
    { id: 'beach', label: 'Beaches' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'wildlife', label: 'Wildlife' },
  ];

  useEffect(() => {
    setLoading(true);
    const url = `/api/destinations?limit=6${selectedType !== 'all' ? `&type=${selectedType}` : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDestinations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedType]);

  return (
    <section className="py-20 px-4 sm:px-6 bg-[var(--color-cream)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
              Curated Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-primary)]">
              Featured Indian Destinations
            </h2>
            <p className="mt-2 text-sm text-[var(--color-secondary)] max-w-xl">
              Authentic destination profiles with verified daily budgets and seasonal ratings.
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="self-start md:self-auto flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            <span>View All Destinations</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                selectedType === cat.id
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm'
                  : 'bg-white text-[var(--color-secondary)] border-[var(--color-border)] hover:border-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw size={24} className="animate-spin text-[var(--color-accent)] mx-auto mb-2" />
            <p className="text-xs text-[var(--color-secondary)]">Loading curated destinations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest._id}
                destination={dest}
                onSelect={(d) => setSelectedDestination(d)}
                onPlanTrip={onPlanTrip}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="px-8 py-3 rounded-full text-xs font-semibold text-[var(--color-primary)] bg-white hover:bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <span>Explore All 430+ Catalogued Destinations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <DestinationDetailModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onPlanTrip={onPlanTrip}
      />
    </section>
  );
};
