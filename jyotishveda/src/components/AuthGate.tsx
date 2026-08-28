import React, { useState } from 'react';
import { Lock, Mail, User, Loader2, Sparkles } from 'lucide-react';
import { login, register, AuthUser } from '../services/authApi';
import { ApiError } from '../services/api';

interface AuthGateProps {
  onAuthenticated: (user: AuthUser) => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register(email, password, fullName);
      onAuthenticated(user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#E5E1D8] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-[#141418] border border-[#2A2A2E] rounded-xl p-7 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#C9A050]/15 border border-[#C9A050] flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-[#C9A050]" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#F0ECE1]">JyotishVeda</h1>
          <p className="text-xs text-[#9E9A90] mt-1">AI Daivajna &middot; Ancient Celestial Wisdom</p>
        </div>

        <div className="flex mb-5 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-sm rounded-md transition cursor-pointer ${
              mode === 'login' ? 'bg-[#C9A050] text-[#0D0D0F] font-semibold' : 'text-[#9E9A90]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-sm rounded-md transition cursor-pointer ${
              mode === 'register' ? 'bg-[#C9A050] text-[#0D0D0F] font-semibold' : 'text-[#9E9A90]'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#C9A050] mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#9E9A90]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-sm text-[#F0ECE1] placeholder-[#9E9A90]/60 focus:outline-none focus:border-[#C9A050]"
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#C9A050] mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#9E9A90]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-sm text-[#F0ECE1] placeholder-[#9E9A90]/60 focus:outline-none focus:border-[#C9A050]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C9A050] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#9E9A90]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-sm text-[#F0ECE1] placeholder-[#9E9A90]/60 focus:outline-none focus:border-[#C9A050]"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-[#E27D60] bg-[#E27D60]/10 border border-[#E27D60]/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#C9A050] text-[#0D0D0F] font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-[#D9B060] transition disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
