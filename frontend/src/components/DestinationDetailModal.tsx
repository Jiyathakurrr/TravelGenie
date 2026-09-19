import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Wallet, ShieldAlert, ShieldCheck, Hotel, Sparkles, Navigation, Phone, ArrowRight } from 'lucide-react';
import { Destination } from '../types';
import { CloudinaryImage } from './CloudinaryImage';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanTrip: (name: string) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
  onPlanTrip,
}) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accommodations' | 'attractions' | 'safety'>('overview');

  useEffect(() => {
    if (!destination) {
      setDetails(null);
      return;
    }
    setLoading(true);
    fetch(`/api/destinations/${destination._id}`)
      .then(res => res.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load destination details:', err);
        setLoading(false);
      });
  }, [destination]);

  if (!destination) return null;

  const data = details || destination;
  const budget = data.estimatedDailyBudget || { budget: 600, mid: 1200, luxury: 3360 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)] my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header Banner */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0">
          <CloudinaryImage
            images={data.images}
            category={data.type}
            alt={data.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/95 text-[var(--color-accent)]">
                {data.type ? data.type.replace(/_/g, ' ') : 'Destination'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-emerald-300 flex items-center gap-1">
                <MapPin size={12} />
                {data.stateName || data.stateId}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {data.name}
            </h2>
            {data.location?.coordinates && (
              <p className="text-xs text-slate-300 mt-1">
                Coordinates: {data.location.coordinates[1].toFixed(2)}°N, {data.location.coordinates[0].toFixed(2)}°E
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Overview & Budget
          </button>
          <button
            onClick={() => setActiveTab('accommodations')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'accommodations'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Accommodations ({data.accommodations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('attractions')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'attractions'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Attractions & Culture ({data.attractions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'safety'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Safety & Seasons
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="text-center py-8 text-sm text-[var(--color-secondary)]">
              Fetching complete destination details...
            </div>
          )}

          {/* TAB 1: OVERVIEW & REAL BUDGET */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-secondary)] mb-2">
                  Destination Description
                </h4>
                <p className="text-sm text-[var(--color-secondary)] leading-relaxed">
                  {data.description || 'Authentic destination catalogued with verified travel metrics.'}
                </p>
              </div>

              {/* Real Daily Budget Breakdown */}
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                  <Wallet size={16} className="text-[var(--color-accent)]" />
                  Estimated Daily Budget Breakdown (INR)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-[var(--color-border)] text-center">
                    <span className="text-xs text-[var(--color-muted)] font-medium">Budget Tier</span>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">₹{budget.budget?.toLocaleString()}</p>
                    <span className="text-[11px] text-[var(--color-muted)]">per person / day</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[var(--color-border)] text-center">
                    <span className="text-xs text-[var(--color-muted)] font-medium">Mid-Range Tier</span>
                    <p className="text-lg font-bold text-[var(--color-accent)] mt-0.5">₹{budget.mid?.toLocaleString()}</p>
                    <span className="text-[11px] text-[var(--color-muted)]">per person / day</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[var(--color-border)] text-center">
                    <span className="text-xs text-[var(--color-muted)] font-medium">Luxury Tier</span>
                    <p className="text-lg font-bold text-amber-600 mt-0.5">₹{budget.luxury?.toLocaleString()}</p>
                    <span className="text-[11px] text-[var(--color-muted)]">per person / day</span>
                  </div>
                </div>
              </div>

              {/* Tags & Metadata */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
                  Tags & Activities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags?.map((t: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-[var(--color-cream)] text-[var(--color-accent)] border border-[var(--color-border)] font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Transport Hubs in Destination */}
              {(data.airports?.length > 0 || data.railwayStations?.length > 0) && (
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-white">
                  <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                    <Navigation size={15} className="text-[var(--color-accent)]" />
                    Nearest Connectivity & Transport Hubs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {data.airports?.map((apt: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <span className="font-semibold text-[var(--color-primary)]">✈️ {apt.name}</span>
                        <p className="text-[var(--color-muted)] text-[11px] mt-0.5">IATA: {apt.iataCode} · {apt.city}</p>
                      </div>
                    ))}
                    {data.railwayStations?.map((stn: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <span className="font-semibold text-[var(--color-primary)]">🚆 {stn.name}</span>
                        <p className="text-[var(--color-muted)] text-[11px] mt-0.5">Code: {stn.stationCode} · Platforms: {stn.platforms || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACCOMMODATIONS */}
          {activeTab === 'accommodations' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[var(--color-primary)] flex items-center gap-2">
                <Hotel size={16} className="text-[var(--color-accent)]" />
                Verified Accommodations in {data.name}
              </h4>

              {data.accommodations && data.accommodations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.accommodations.map((acc: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-bold text-sm text-[var(--color-primary)]">{acc.name}</h5>
                        {acc.starRating && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            ★ {acc.starRating}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-muted)] mt-1">{acc.address || 'Address registered in database'}</p>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[var(--color-border)]">
                        <span className="text-[var(--color-secondary)]">Price per night:</span>
                        <span className="font-semibold text-[var(--color-accent)]">
                          ₹{acc.pricePerNight?.min?.toLocaleString() || 1500} - ₹{acc.pricePerNight?.max?.toLocaleString() || 4000}
                        </span>
                      </div>

                      {acc.amenities && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {acc.amenities.slice(0, 4).map((amen: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {amen}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-secondary)]">
                  Accommodations for {data.name} are curated directly in custom itinerary proposals.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTRACTIONS & SIGHTSEEING */}
          {activeTab === 'attractions' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[var(--color-primary)] flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--color-accent)]" />
                Notable Attractions & Cultural Highlights
              </h4>

              {data.attractions && data.attractions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.attractions.map((att: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-white">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-sm text-[var(--color-primary)]">{att.name}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">
                          {att.type || 'Sightseeing'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-secondary)] mt-1.5 leading-relaxed">
                        {att.description || 'Cultural attraction in database.'}
                      </p>
                      <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-muted)]">
                        <span>Duration: ~{att.estimatedDurationMins || 90} mins</span>
                        <span>Entry: {att.entryFee?.adult ? `₹${att.entryFee.adult}` : 'Free'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-secondary)]">
                  Attractions for {data.name} are dynamically surfaced via our AI itinerary generator.
                </div>
              )}

              {/* Pilgrimage sites */}
              {data.pilgrimageSites && data.pilgrimageSites.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)] mb-3">
                    Pilgrimage & Sacred Heritage Sites
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.pilgrimageSites.map((pilgrim: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-[var(--color-border)] bg-amber-50/50">
                        <span className="font-bold text-xs text-amber-900">🛕 {pilgrim.name}</span>
                        <p className="text-[11px] text-amber-800 mt-1">{pilgrim.significance || `Deity: ${pilgrim.deity || 'Traditional'}`}</p>
                        {pilgrim.dressCode && (
                          <span className="text-[10px] text-amber-700 mt-1 block">Dress Code: {pilgrim.dressCode}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAFETY & SEASONS */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              {/* Safety */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[var(--color-primary)] flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Safety Profile & Advisories
                  </h4>
                  {data.safety?.overallRating && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Rating: {data.safety.overallRating} / 5.0
                    </span>
                  )}
                </div>

                {data.safety?.advisories && data.safety.advisories.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-xs text-[var(--color-secondary)]">
                    {data.safety.advisories.map((adv: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--color-secondary)] mt-2">
                    General Indian travel guidelines apply: follow local regulations, carry valid ID, and drink bottled or filtered water.
                  </p>
                )}

                {data.safety?.emergencyContacts && data.safety.emergencyContacts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                    <h5 className="text-xs font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--color-accent)]" />
                      Emergency Numbers
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {data.safety.emergencyContacts.map((contact: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-[var(--color-surface)] flex justify-between">
                          <span className="text-[var(--color-secondary)] capitalize">{contact.type}</span>
                          <span className="font-bold text-[var(--color-primary)]">{contact.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Seasons */}
              {data.seasons && (
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-white">
                  <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[var(--color-accent)]" />
                    Seasonal Weather & Recommended Timing
                  </h4>
                  {data.seasons.bestFor && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {data.seasons.bestFor.map((item: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          Recommended for {item}
                        </span>
                      ))}
                    </div>
                  )}
                  {data.seasons.peakSeason && (
                    <div className="space-y-2 mt-2">
                      <span className="text-xs font-semibold text-[var(--color-secondary)]">Peak Months:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {data.seasons.peakSeason.map((peak: any, i: number) => (
                          <div key={i} className="p-2 rounded bg-[var(--color-surface)] text-xs">
                            <span className="font-bold text-[var(--color-primary)]">Month {peak.month}</span>
                            <p className="text-[var(--color-muted)] text-[11px]">{peak.weather} · Crowd: {peak.crowdLevel}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between shrink-0">
          <div className="text-xs text-[var(--color-secondary)]">
            <span>Database ID: <code className="text-gray-500">{data._id}</code></span>
          </div>
          <button
            onClick={() => {
              onClose();
              onPlanTrip(data.name);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[var(--color-accent)] hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Plan Itinerary for {data.name}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
