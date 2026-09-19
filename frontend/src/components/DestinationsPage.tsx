import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RefreshCw, Compass } from 'lucide-react';
import { Destination } from '../types';
import { DestinationCard } from './DestinationCard';
import { DestinationDetailModal } from './DestinationDetailModal';
import { getApiUrl } from '../utils/api';

interface DestinationsPageProps {
  onPlanTrip: (destinationName: string) => void;
}

export const DestinationsPage: React.FC<DestinationsPageProps> = ({ onPlanTrip }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'hill_station', label: 'Hill Stations' },
    { id: 'beach', label: 'Beaches' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'wildlife', label: 'Wildlife' },
    { id: 'pilgrimage', label: 'Pilgrimage' },
    { id: 'city', label: 'Cities & Towns' },
  ];

  const fetchDestinations = () => {
    setLoading(true);
    const url = getApiUrl(`/api/destinations?limit=80${selectedType !== 'all' ? `&type=${selectedType}` : ''}${
      searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
    }`);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDestinations(data);
        } else {
          setDestinations([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching destinations:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDestinations();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDestinations();
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pb-24">
      {/* Hero Header */}
      <section className="px-6 pt-16 pb-12 text-center bg-white border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
            Verified Destination Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[var(--color-primary)] tracking-tight">
            Our Destinations
          </h1>
          <p className="mt-4 text-base max-w-xl mx-auto text-[var(--color-secondary)]">
            From sun-kissed beaches to snow-capped peaks — explore verified destinations with real budget calculations and AI-crafted itineraries.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-xl mx-auto flex items-center gap-2 bg-[var(--color-surface)] p-2 rounded-full border border-[var(--color-border)] shadow-sm focus-within:border-[var(--color-accent)] transition-all"
          >
            <div className="pl-3 text-[var(--color-muted)]">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations (e.g., Mumbai, Manali, Goa, Jaipur)..."
              className="flex-1 bg-transparent px-2 text-sm text-[var(--color-primary)] placeholder-[var(--color-muted)] focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[var(--color-accent)] hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories Filter Bar */}
      <section className="sticky top-20 z-30 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedType === cat.id
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-secondary)] border-[var(--color-border)] hover:border-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--color-secondary)] font-medium shrink-0">
            <span>{destinations.length} verified destinations</span>
          </div>
        </div>
      </section>

      {/* Grid of Destination Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={28} className="animate-spin text-[var(--color-accent)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--color-secondary)]">
              Fetching destination catalog and regional data...
            </p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-[var(--color-border)] p-8 max-w-lg mx-auto">
            <Compass size={40} className="text-[var(--color-muted)] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[var(--color-primary)]">No destinations found</h3>
            <p className="text-xs text-[var(--color-secondary)] mt-1">
              Try modifying your search term or select another category filter.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[var(--color-accent)]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
      </section>

      {/* Detail Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onPlanTrip={onPlanTrip}
      />
    </div>
  );
};
