import React, { useState } from 'react';
import { Star, ChevronDown, Sparkles } from 'lucide-react';

interface HomeTestimonialsAndFaqProps {
  onPlanTrip: () => void;
}

export const HomeTestimonialsAndFaq: React.FC<HomeTestimonialsAndFaqProps> = ({ onPlanTrip }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testimonials = [
    {
      name: 'Rohan Mehta',
      role: 'Solo Backpacker · Mumbai',
      quote:
        'TravelGenie planned my 5-day Himachal getaway on an exact ₹18,000 budget. The HRTC bus schedules and local homestays in Old Manali matched real on-ground prices.',
      rating: 5,
    },
    {
      name: 'Ananya & Vikram',
      role: 'Couple · Bengaluru',
      quote:
        'The monsoon Goa itinerary was unreal. Instead of crowded clubs, it routed us through quiet spice plantations and backwater kayaking in Divar Island.',
      rating: 5,
    },
    {
      name: 'Dr. Suresh Nair',
      role: 'Family Explorer · Delhi',
      quote:
        'Having emergency contact numbers, verified medical clinics, and seasonal weather alerts for each destination gave our family immense peace of mind.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'How does TravelGenie estimate daily budgets?',
      a: 'Our destination catalog stores realistic tier-based daily expense metrics (budget, mid-range, and luxury) derived from regional accommodation averages, daily food costs, local transportation, and entry fees across Indian states.',
    },
    {
      q: 'Are destination images and accommodations authentic?',
      a: 'Yes! All images are served directly via Cloudinary CDN with fallback handlers to ensure optimal visual fidelity. Accommodations, attractions, and safety guidelines are synced directly with verified records.',
    },
    {
      q: 'Can the AI planner handle customized group budgets?',
      a: 'Absolutely. In the Trip Planner, tell TravelGenie your party size, preferred transportation (train, flight, or bus), and overall budget in INR, and the AI will optimize your stay and day-to-day schedule accordingly.',
    },
    {
      q: 'How do payments and bookings work?',
      a: 'TravelGenie provides architectural hooks for Razorpay integration (currently running in Test Mode for sandbox validation) to confirm itinerary lock-in and travel package reservations.',
    },
  ];

  return (
    <>
      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--color-cream)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
              Traveller Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-primary)]">
              What travellers say
            </h2>
            <p className="mt-3 text-sm text-[var(--color-secondary)]">
              Real journeys made seamless by our pan-India travel intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-secondary)] leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                  <h4 className="font-bold text-sm text-[var(--color-primary)]">{t.name}</h4>
                  <span className="text-xs text-[var(--color-muted)]">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
              Common Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--color-primary)]">
              Frequently asked
            </h2>
            <p className="mt-3 text-sm text-[var(--color-secondary)]">
              Everything you need to know about our data models, routing engine, and budget algorithms.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--color-border)] overflow-hidden transition-all bg-[var(--color-surface)]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[var(--color-primary)]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[var(--color-secondary)] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[var(--color-accent)]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-[var(--color-secondary)] leading-relaxed border-t border-gray-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--color-accent)] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
            Start Your Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Ready for your next adventure?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Let Travel Genie construct your custom itinerary grounded in real destinations, hotels, and daily budgets across India.
          </p>
          <div className="pt-2">
            <button
              onClick={onPlanTrip}
              className="px-8 py-3.5 rounded-full text-sm font-semibold text-[var(--color-accent)] bg-white hover:bg-amber-100 transition-colors shadow-lg inline-flex items-center gap-2"
            >
              <Sparkles size={16} className="text-amber-600" />
              <span>Plan With Travel Genie</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
