import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, email: string) => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus('error');
      setErrorMessage('Please completely fill in both access parameters.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setTimeout(() => {
          onLoginSuccess(data.token, data.user.email);
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Access denied. Please check your credentials.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('A connectivity error occurred while synchronizing keys with the authentication gateway.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in duration-300 font-sans">
      <div className="bg-cream-paper border border-cream-dark rounded-2xl p-8 md:p-10 shadow-xl space-y-8 relative overflow-hidden">
        
        {/* Subtle background brand mark */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full border border-cream-dark/10 pointer-events-none" />

        {/* Header toolbar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#7c7a72] hover:text-charcoal-intense uppercase tracking-wider transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Public Journal</span>
          </button>
          
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-charcoal-intense border border-charcoal-soft rounded-full text-[9px] font-bold text-brass-light tracking-widest uppercase">
            <span>Secure Gate</span>
          </div>
        </div>

        {/* Branding Intro */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-extrabold text-charcoal-intense tracking-tight">
            Admin Lockout
          </h1>
          <p className="text-xs text-[#7c7a72] leading-relaxed">
            Verify layout authorization parameters to gain writing privileges on the LLM Review Pro engine. Please login below:
          </p>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email parameter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
              Administrative Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-[#7c7a72]/84" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full bg-white border border-cream-dark/80 rounded-xl py-3 pl-10 pr-4 text-xs text-charcoal-intense placeholder-[#7c7a72]/50 focus:outline-none focus:border-brass-accent focus:ring-1 focus:ring-brass-accent transition-all"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
          </div>

          {/* Password Parameter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">
              <span>Internal Password</span>
              <span className="normal-case font-mono font-medium text-[9px] text-[#929087]">Preset requirement</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-0.5">
                <Lock className="w-4 h-4 text-[#7c7a72]/84" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="********"
                className="w-full bg-white border border-cream-dark/80 rounded-xl py-3 pl-10 pr-11 text-xs text-charcoal-intense placeholder-[#7c7a72]/50 focus:outline-none focus:border-brass-accent focus:ring-1 focus:ring-brass-accent transition-all"
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7c7a72] hover:text-charcoal-intense transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback banners */}
          {status === 'error' && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 animate-shake text-xs text-red-700">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans">{errorMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 animate-fade-in text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold font-sans">Authorized. Initializing control room panels...</p>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full py-3.5 bg-charcoal-intense hover:bg-charcoal-soft disabled:opacity-50 text-cream-base rounded-xl font-bold text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {status === 'loading' ? (
              <>
                <span className="w-4 h-4 border-2 border-cream-base border-t-transparent rounded-full animate-spin"></span>
                <span>Resolving Gateways...</span>
              </>
            ) : (
              <span>Unlock Admin Panel</span>
            )}
          </button>

        </form>

        <div className="pt-6 border-t border-cream-dark/60 text-center text-[10px] text-[#7c7a72] font-mono leading-relaxed">
          <p>This workstation remains closed to public writers.</p>
          <p className="mt-0.5">Authoritative token expires on session termination.</p>
        </div>

      </div>
    </div>
  );
};
