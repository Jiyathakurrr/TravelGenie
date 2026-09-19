import React from 'react';
import { Compass, Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[var(--color-primary)] text-white/90 pt-16 pb-8 border-t border-[var(--color-border-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-amber-300">
                <Compass size={20} />
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                Travel Genie
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              An AI-powered travel companion designed to create hyper-personalized, budget-conscious pan-India itineraries grounded in authentic verified travel data.
            </p>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Travel Network & Knowledge Base</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('destinations')} className="hover:text-white transition-colors">
                  Destinations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages')} className="hover:text-white transition-colors">
                  Travel Packages
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('plan')} className="hover:text-white transition-colors">
                  AI Trip Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">
                  Travel Stories & Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Top Regions
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('destinations')} className="hover:text-white transition-colors">
                  Maharashtra (Mumbai, Pune, Nagpur)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('destinations')} className="hover:text-white transition-colors">
                  Rajasthan (Jaipur, Udaipur, Jodhpur)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('destinations')} className="hover:text-white transition-colors">
                  Himachal Pradesh (Manali, Shimla)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('destinations')} className="hover:text-white transition-colors">
                  Kerala (Kochi, Munnar, Alleppey)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('destinations')} className="hover:text-white transition-colors">
                  Northeast (Meghalaya, Manipur, Sikkim)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Contact Us
            </h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-amber-300 shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-300 shrink-0" />
                <a href="mailto:travelgenie.work@gmail.com" className="hover:text-white transition-colors">
                  travelgenie.work@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-amber-300 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 Travel Genie · Mumbai, India · AI Travel Concierge · Payments via Razorpay Test Mode only</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart size={12} className="text-rose-400 fill-rose-400" />
            <span>for Pan-India Explorers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
