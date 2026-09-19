import React from 'react';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { CloudinaryImage } from './CloudinaryImage';

interface BlogPageProps {
  onPlanTrip: (dest: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onPlanTrip }) => {
  const articles = [
    {
      id: 'goa-monsoon',
      title: 'Goa in the Monsoon: Why Off-Season is Actually Perfect',
      category: 'Beaches & Nature',
      readTime: '6 min read',
      date: 'September 2026',
      author: 'TravelGenie Editorial',
      excerpt:
        'Between June and September, Goa transforms from a buzzing beach party hub into an emerald paradise of cascading waterfalls, silent spice plantations, and unhurried coastal drives.',
      imageCategory: 'beach',
      destination: 'Goa',
    },
    {
      id: 'manali-budget',
      title: "Manali on ₹15,000 for 5 Days: The Budget Traveller's Playbook",
      category: 'Budget Hacks',
      readTime: '8 min read',
      date: 'August 2026',
      author: 'Aakash Sharma',
      excerpt:
        'A comprehensive guide on taking HRTC Volvo buses from Delhi or Chandigarh, securing cozy Old Manali homestays, and dining on authentic trout without breaking the bank.',
      imageCategory: 'mountains',
      destination: 'Manali',
    },
    {
      id: 'ai-travel-planner',
      title: 'How We Built an AI Travel Planner for Our Capstone Project',
      category: 'Engineering & Data',
      readTime: '10 min read',
      date: 'July 2026',
      author: 'TravelGenie Tech Team',
      excerpt:
        'Architecting a pan-India travel companion grounded in a comprehensive 17-domain travel knowledge base, Cloudinary media CDN, and generative AI for dynamic route optimization.',
      imageCategory: 'scenic',
      destination: 'Mumbai',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pb-24">
      {/* Header */}
      <section className="px-6 pt-16 pb-12 text-center bg-white border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-accent)] mb-2 inline-block">
            Curated Insights
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[var(--color-primary)]">
            Stories & Guides
          </h1>
          <p className="mt-3 text-sm text-[var(--color-secondary)]">
            Field notes, budget travel playbooks, and technical insights from our Mumbai-based travel engineering team.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-gray-100">
                  <CloudinaryImage
                    category={art.imageCategory}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-accent)] shadow-sm">
                    {art.category}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {art.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {art.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-[var(--color-primary)] tracking-tight leading-snug">
                    {art.title}
                  </h3>

                  <p className="mt-3 text-xs text-[var(--color-secondary)] leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onPlanTrip(art.destination)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-surface)] hover:bg-[var(--color-cream)] border border-[var(--color-border)] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Plan Trip to {art.destination}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
