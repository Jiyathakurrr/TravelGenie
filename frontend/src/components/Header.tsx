import React, { useState, useEffect } from 'react';
import { Compass, Menu, X, User, LogOut, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('travelgenie_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('travelgenie_token');
    localStorage.removeItem('travelgenie_user');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'packages', label: 'Packages' },
    { id: 'plan', label: 'Trip Planner' },
    { id: 'blog', label: 'Blog' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-[var(--color-border)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Compass size={22} className="text-amber-300" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[var(--color-primary)] tracking-tight">
              Travel Genie
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[var(--color-accent)] -mt-1">
              Pan-India AI Concierge
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-sm font-medium transition-colors hover:text-[var(--color-accent)] ${
                currentTab === link.id
                  ? 'text-[var(--color-accent)] font-semibold border-b-2 border-[var(--color-accent)] pb-1'
                  : 'text-[var(--color-secondary)]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                <User size={13} className="text-[var(--color-accent)]" />
                {user.name || user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--color-secondary)] hover:text-rose-600 transition-colors p-1"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-[var(--color-secondary)] hover:text-[var(--color-primary)] px-3 py-2 transition-colors"
            >
              Log In
            </button>
          )}

          <button
            onClick={() => onNavigate('plan')}
            className="flex items-center gap-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:opacity-95 transition-all px-5 py-2.5 rounded-full shadow-sm hover:shadow"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Plan a Trip</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onNavigate('plan')}
            className="text-xs font-semibold text-white bg-[var(--color-accent)] px-3 py-1.5 rounded-full"
          >
            Plan
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--color-border)] bg-white px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 text-sm font-medium ${
                currentTab === link.id
                  ? 'text-[var(--color-accent)] font-bold'
                  : 'text-[var(--color-secondary)]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-[var(--color-primary)] font-medium">
                  Signed in as <b>{user.name || user.email}</b>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-[var(--color-accent)]"
              >
                Log In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
