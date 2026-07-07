import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, Feather } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('Thank you for subscribing to weekly stories!');
      } else {
        setStatus('error');
        setMessage('Subscription failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection issue. Please retry.');
    }
  };

  return (
    <footer className="bg-charcoal-intense text-[#9a9994] border-t border-cream-dark/10 py-16 mt-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-cream-dark/10">
          
          {/* Logo Brand Footer column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cream-base flex items-center justify-center">
                <Feather className="w-4 h-4 text-charcoal-intense" />
              </div>
              <span className="font-serif text-lg font-bold text-cream-base tracking-tight">
                LLM Review Pro
              </span>
            </div>
            <p className="font-serif italic text-sm text-cream-dark/60 leading-relaxed max-w-sm">
              "Expert evaluations and in-depth analytical reviews of large language models, AI architectures, and intelligent systems."
            </p>
          </div>

          {/* Links columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="font-sans text-[11px] font-bold text-cream-base tracking-widest uppercase">
                Categories
              </h5>
              <ul className="space-y-2 text-xs text-left">
                <li><a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Programming</a></li>
                <li><a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Technology</a></li>
                <li><a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Sabbaticals</a></li>
                <li><a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Fine Art</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-sans text-[11px] font-bold text-cream-base tracking-widest uppercase">
                Enterprise Info
              </h5>
              <ul className="space-y-2 text-xs text-left">
                <li><a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">About Us</a></li>
                <li><a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Privacy Statement</a></li>
                <li><a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Terms of Service</a></li>
                <li><a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="hover:text-cream-base transition-colors cursor-pointer text-left block">Contact Portal</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter section */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="font-sans text-[11px] font-bold text-cream-base tracking-widest uppercase">
              Weekly Insight Newsletter
            </h5>
            <p className="text-xs text-cream-dark/60 leading-relaxed">
              Join 18,400+ writers and designers receiving our selected digital essays on software architecture and tactile interfaces. No junk list, guaranteed.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2 font-sans mt-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7a72]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#1e1e1e] border border-cream-dark/10 rounded-lg py-2.5 pl-9 pr-4 text-xs text-cream-base placeholder-on-surface-variant/40 focus:outline-none focus:border-brass-accent transition-colors"
                  disabled={status === 'loading'}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-brass-accent hover:bg-brass-light text-cream-base font-medium px-4 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-3.5 h-3.5 border-2 border-cream-base border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Join</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>

            {status === 'success' && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{message}</span>
              </div>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-400 mt-2">{message}</p>
            )}
          </div>

        </div>

        {/* Legal bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 text-xs text-cream-dark/30 font-sans gap-4">
          <p>© {new Date().getFullYear()} LLM Review Pro. All rights reserved. In-depth evaluations of neural structures.</p>
          <div className="flex gap-6">
            <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="hover:text-cream-base transition-colors cursor-pointer">Privacy Policy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="hover:text-cream-base transition-colors cursor-pointer">CMS Terms</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="hover:text-cream-base transition-colors cursor-pointer">Contact Us</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
