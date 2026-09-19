import React from 'react';
import { MapPin, Calendar, Wallet, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { Destination } from '../types';
import { CloudinaryImage } from './CloudinaryImage';

interface DestinationCardProps {
  destination: Destination;
  onSelect?: (dest: Destination) => void;
  onPlanTrip?: (destName: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
  onPlanTrip,
}) => {
  const budget = destination.estimatedDailyBudget || { budget: 600, mid: 1200, luxury: 3360 };
  const bestSeason = (destination.bestMonths && destination.bestMonths.length > 0)
    ? destination.bestMonths.slice(0, 3).join(', ')
    : (destination as any).bestTimeToVisit
      ? (destination as any).bestTimeToVisit.slice(0, 3).join(', ')
      : 'Oct - Mar';

  const formatType = (type: string) => {
    return type ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Destination';
  };

  return (
    <div
      id={`dest-card-${destination._id}`}
      className="group relative rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-xl)] hover:-translate-y-1 flex flex-col bg-white border border-[var(--color-border)]"
    >
      {/* Hero Image from Cloudinary with Fallback */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <CloudinaryImage
          images={destination.images}
          category={destination.type}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/95 text-[var(--color-accent)] backdrop-blur-md shadow-sm">
            {formatType(destination.type)}
          </span>
        </div>

        {/* State Tag */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white text-xs font-medium drop-shadow-md">
          <MapPin size={13} className="text-emerald-400" />
          <span>{destination.stateName || destination.stateId}</span>
        </div>

        {/* Budget tier badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
          {destination.budgetCategory ? destination.budgetCategory.toUpperCase() : 'BUDGET'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold tracking-tight text-[var(--color-primary)] font-serif group-hover:text-[var(--color-accent)] transition-colors">
              {destination.name}
            </h3>
          </div>

          <p className="mt-2 text-xs line-clamp-2 leading-relaxed text-[var(--color-secondary)]">
            {destination.description || `Explore the enchanting destinations, culture, and cuisine of ${destination.name}.`}
          </p>

          {/* Quick Real Data Badges */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[var(--color-secondary)]">
              <Wallet size={14} className="text-[var(--color-accent)] shrink-0" />
              <span className="truncate">₹{budget.budget.toLocaleString()} - ₹{budget.luxury.toLocaleString()}/d</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--color-secondary)]">
              <Calendar size={14} className="text-[var(--color-accent)] shrink-0" />
              <span className="truncate">{bestSeason}</span>
            </div>
          </div>

          {/* Real Tags */}
          {destination.tags && destination.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {destination.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-secondary)] border border-[var(--color-border)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
          <button
            onClick={() => onSelect?.(destination)}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-secondary)] hover:text-[var(--color-accent)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--color-surface)]"
            title="Inspect full destination details, hotels & safety notes"
          >
            <Info size={14} />
            <span>Details</span>
          </button>

          <button
            onClick={() => onPlanTrip?.(destination.name)}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-[var(--color-accent)] hover:opacity-90 transition-opacity px-3.5 py-1.5 rounded-full shadow-sm"
          >
            <span>Plan Trip</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
