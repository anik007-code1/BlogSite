import React from 'react';
import { Feather, Shield, BookOpen, Laptop, Sparkles, LogOut, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact';
  onNavigate: (view: 'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact') => void;
  selectedArticleSlug?: string;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedArticleSlug,
  isAdminAuthenticated,
  onLogout
}) => {
  const isDashboardOrEditor = currentView === 'dashboard' || currentView === 'editor';

  return (
    <header className="sticky top-0 z-40 bg-cream-base/90 backdrop-blur-md border-b border-cream-dark/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Branding */}
          <a 
            href="/"
            onClick={(e) => { e.preventDefault(); onNavigate('home'); }} 
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-full bg-charcoal-intense flex items-center justify-center text-cream-base transition-transform group-hover:rotate-12 duration-300">
              <Feather className="w-5 h-5 text-cream-base" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-charcoal-intense group-hover:text-brass-accent transition-colors">
                LLM Review Pro
              </span>
              <p className="font-sans text-[10px] tracking-widest text-[#7c7a72] uppercase font-medium">
                Expert Evaluations
              </p>
            </div>
          </a>

          {/* Core Interactive Actions */}
          <div className="flex items-center gap-4">
            
            {/* Context Notice Tag - Only show to admin */}
            {isAdminAuthenticated && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-cream-paper border border-cream-dark/40 rounded-full text-[11px] font-medium text-brass-accent uppercase tracking-wider font-sans">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Full-Stack Admin Mode</span>
              </div>
            )}

            {/* Navigation Buttons based on login state */}
            {isAdminAuthenticated ? (
              <>
                {isDashboardOrEditor ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="flex items-center gap-2 px-4 py-2 border border-cream-dark/80 bg-cream-paper hover:bg-cream-dark rounded-lg text-sm font-medium transition-all duration-200 shadow-sm cursor-pointer"
                    id="view-blog-button"
                  >
                    <BookOpen className="w-4 h-4 text-charcoal-soft" />
                    <span className="hidden sm:inline">View Public Blog</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base rounded-lg text-sm font-medium transition-all duration-200 shadow-md group cursor-pointer"
                    id="cms-dashboard-button"
                  >
                    <Shield className="w-4 h-4 text-brass-light group-hover:scale-110 transition-transform" />
                    <span>CMS Dashboard</span>
                  </button>
                )}

                {/* CMS Avatar Access trigger */}
                <div 
                  onClick={() => onNavigate('dashboard')}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-brass-accent text-cream-base border border-cream-dark hover:border-charcoal-intense cursor-style cursor-pointer font-sans text-sm font-bold transition-colors hidden sm:flex"
                  title="Administrator Profile"
                >
                  {localStorage.getItem('vellum_admin_email')?.[0]?.toUpperCase() || 'A'}
                </div>

                {/* Logout Action */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm cursor-pointer"
                  title="Logout Session"
                  id="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : null}

          </div>
        </div>
      </div>
    </header>
  );
};
