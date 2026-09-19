import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeHero } from './components/HomeHero';
import { HomeFeatures } from './components/HomeFeatures';
import { HomeDestinationsPreview } from './components/HomeDestinationsPreview';
import { PackagesSection } from './components/PackagesSection';
import { HomeTestimonialsAndFaq } from './components/HomeTestimonialsAndFaq';
import { DestinationsPage } from './components/DestinationsPage';
import { TripPlanner } from './components/TripPlanner';
import { BlogPage } from './components/BlogPage';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [plannerDestination, setPlannerDestination] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync with browser URL hash or search params
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const params = new URLSearchParams(window.location.search);
      const destParam = params.get('destination') || params.get('dest');

      if (destParam) {
        setPlannerDestination(destParam);
        setCurrentTab('plan');
      } else if (path === 'destinations') {
        setCurrentTab('destinations');
      } else if (path === 'plan') {
        setCurrentTab('plan');
      } else if (path === 'blog') {
        setCurrentTab('blog');
      } else if (path === 'packages') {
        setCurrentTab('packages');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = tab === 'home' ? '/' : `/${tab}`;
    window.history.pushState({}, '', url);
  };

  const handlePlanTrip = (destinationName?: string) => {
    if (destinationName) {
      setPlannerDestination(destinationName);
    }
    setCurrentTab('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = destinationName ? `/plan?destination=${encodeURIComponent(destinationName)}` : '/plan';
    window.history.pushState({}, '', url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-cream)] text-[var(--color-primary)] selection:bg-amber-200">
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Page Content based on currentTab */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <HomeHero
              onPlanTrip={() => handlePlanTrip()}
              onExploreDestinations={() => handleNavigate('destinations')}
            />
            <HomeFeatures />
            <HomeDestinationsPreview
              onViewAll={() => handleNavigate('destinations')}
              onPlanTrip={handlePlanTrip}
            />
            <PackagesSection onPlanTrip={handlePlanTrip} />
            <HomeTestimonialsAndFaq onPlanTrip={() => handlePlanTrip()} />
          </>
        )}

        {currentTab === 'destinations' && (
          <DestinationsPage onPlanTrip={handlePlanTrip} />
        )}

        {currentTab === 'packages' && (
          <div className="pt-8">
            <PackagesSection onPlanTrip={handlePlanTrip} />
          </div>
        )}

        {currentTab === 'plan' && (
          <TripPlanner
            initialDestination={plannerDestination}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'blog' && (
          <BlogPage onPlanTrip={handlePlanTrip} />
        )}
      </main>

      {/* Universal Footer (hidden in dedicated chat planner for app-like viewport height) */}
      {currentTab !== 'plan' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          // Re-render auth state
          window.dispatchEvent(new Event('storage'));
        }}
      />
    </div>
  );
}
