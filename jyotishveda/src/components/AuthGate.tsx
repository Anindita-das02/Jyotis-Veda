import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Loader2, Sparkles, X, ShieldCheck, RotateCcw, Calendar, MapPin, AlertCircle, Plus, UserCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, register, loginWithGoogle, AuthUser } from '../services/authApi';
import { ApiError } from '../services/api';
import { AncientTraditionLogo } from './AncientTraditionLogo';

interface AuthGateProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAuthenticated: (user: AuthUser, registrationDetails?: { gender?: string; birthDate?: string; birthPlace?: string; birthTime?: string }) => void;
  initialMode?: 'login' | 'register';
  theme?: 'light' | 'dark';
}

const CITIES_LIST = [
  'Kolkata, West Bengal, India',
  'New Delhi, Delhi, India',
  'Mumbai, Maharashtra, India',
  'Bengaluru, Karnataka, India',
  'Chennai, Tamil Nadu, India',
  'Hyderabad, Telangana, India',
  'Ahmedabad, Gujarat, India',
  'Pune, Maharashtra, India',
  'Jaipur, Rajasthan, India',
  'Lucknow, Uttar Pradesh, India',
  'Patna, Bihar, India',
  'Guwahati, Assam, India',
  'Bhubaneswar, Odisha, India',
  'Siliguri, West Bengal, India',
  'Howrah, West Bengal, India',
  'Dhaka, Bangladesh',
  'Chittagong, Bangladesh',
  'Sylhet, Bangladesh',
  'London, United Kingdom',
  'New York, USA',
  'San Francisco, USA',
  'Dubai, United Arab Emirates',
  'Singapore',
  'Toronto, Canada',
  'Sydney, Australia',
];

const MONTHS = [
  { value: '01', name: 'January (01)' },
  { value: '02', name: 'February (02)' },
  { value: '03', name: 'March (03)' },
  { value: '04', name: 'April (04)' },
  { value: '05', name: 'May (05)' },
  { value: '06', name: 'June (06)' },
  { value: '07', name: 'July (07)' },
  { value: '08', name: 'August (08)' },
  { value: '09', name: 'September (09)' },
  { value: '10', name: 'October (10)' },
  { value: '11', name: 'November (11)' },
  { value: '12', name: 'December (12)' },
];

interface GoogleAccountItem {
  id: string;
  name: string;
  email: string;
  avatarBg: string;
  initial: string;
  status?: string;
}

const USER_GOOGLE_ACCOUNTS: GoogleAccountItem[] = [
  {
    id: '1',
    name: 'Keya Biswas',
    email: 'keyabis2001@gmail.com',
    avatarBg: 'from-amber-500 to-rose-500',
    initial: 'K',
  },
  {
    id: '2',
    name: 'Keya Biswas',
    email: 'keyab489@gmail.com',
    avatarBg: 'from-blue-500 to-cyan-500',
    initial: 'K',
  },
  {
    id: '3',
    name: 'Irish Dasgupta',
    email: 'dasguptairish@gmail.com',
    avatarBg: 'from-emerald-600 to-teal-500',
    initial: 'I',
  },
  {
    id: '4',
    name: 'Keya Biswas',
    email: 'keyab095@gmail.com',
    avatarBg: 'from-purple-600 to-indigo-500',
    initial: 'K',
    status: 'Signed out',
  },
  {
    id: '5',
    name: 'KEYA ROY',
    email: 'kroy83861@gmail.com',
    avatarBg: 'from-indigo-600 to-violet-500',
    initial: 'K',
    status: 'Signed out',
  },
  {
    id: '6',
    name: 'keya biswasas',
    email: 'keyabiswasas@gmail.com',
    avatarBg: 'from-pink-600 to-rose-500',
    initial: 'K',
    status: 'Signed out',
  },
];

export function AuthGate({
  isOpen = true,
  onClose,
  onAuthenticated,
  initialMode = 'login',
  theme = 'light',
}: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Registration Fields: Gender, Place, Date of Birth, Time of Birth
  const [gender, setGender] = useState<'male' | 'female' | 'others'>('male');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDay, setBirthDay] = useState('01');
  const [birthMonth, setBirthMonth] = useState('01');
  const [birthYear, setBirthYear] = useState('2000');
  const [birthTime, setBirthTime] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  
  // Google Account Chooser State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [showOtherAccountInput, setShowOtherAccountInput] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [googleSelectedAccount, setGoogleSelectedAccount] = useState<{ email: string; name: string } | null>(null);

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptchaInput('');
  };

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
    refreshCaptcha();
  }, [initialMode, isOpen]);

  const handleGoogleSuccess = async (targetEmail: string, targetName: string, accountId?: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail.trim())) {
      setGoogleAuthError('Please enter a valid email address (e.g. yourname@gmail.com)');
      return;
    }

    if (accountId) {
      setSelectedAccountId(accountId);
    }
    setError(null);
    setGoogleAuthError(null);

    // If registering, switch directly to the full registration details form
    if (mode === 'register') {
      setEmail(targetEmail.trim().toLowerCase());
      setFullName(targetName.trim() || targetEmail.split('@')[0]);
      setGoogleSelectedAccount({
        email: targetEmail.trim().toLowerCase(),
        name: targetName.trim() || targetEmail.split('@')[0],
      });
      setIsGoogleModalOpen(false);
      setSelectedAccountId(null);
      refreshCaptcha();
      return;
    }

    // In login mode, try direct login first
    setLoading(true);
    try {
      const user = await loginWithGoogle(targetEmail.trim().toLowerCase(), targetName.trim() || 'Google User');
      const formattedDob = `${birthYear}-${birthMonth}-${birthDay}`;
      onAuthenticated(user, {
        gender,
        birthDate: formattedDob,
        birthPlace,
        birthTime: birthTime.trim() || undefined,
      });
      setIsGoogleModalOpen(false);
      if (onClose) onClose();
    } catch (err) {
      // If user is not yet registered or login fails, transition to Register form with details
      setMode('register');
      setEmail(targetEmail.trim().toLowerCase());
      setFullName(targetName.trim() || targetEmail.split('@')[0]);
      setGoogleSelectedAccount({
        email: targetEmail.trim().toLowerCase(),
        name: targetName.trim() || targetEmail.split('@')[0],
      });
      setIsGoogleModalOpen(false);
      setError('Please set a password and your birth details to complete registration.');
      refreshCaptcha();
    } finally {
      setLoading(false);
      setSelectedAccountId(null);
    }
  };

  const handleGoogleButtonClick = () => {
    setError(null);
    setGoogleAuthError(null);

    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const google = (window as any).google;

    if (googleClientId && google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setGoogleAuthError(tokenResponse.error_description || 'Google sign-in was not completed.');
              }
              return;
            }
            if (tokenResponse?.access_token) {
              setLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                if (userInfo?.email) {
                  await handleGoogleSuccess(userInfo.email, userInfo.name || userInfo.email.split('@')[0]);
                } else {
                  throw new Error('Could not retrieve email from Google profile.');
                }
              } catch (err: any) {
                const msg = err instanceof ApiError ? err.message : (err?.message || 'Google authentication failed.');
                setError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn('Google Token Client init error, falling back to modal:', e);
      }
    }

    setIsGoogleModalOpen(true);
  };

  // Generate day options 01 - 31
  const days = Array.from({ length: 31 }, (_, i) => {
    const val = (i + 1).toString().padStart(2, '0');
    return val;
  });

  // Generate year options 1940 - 2026
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => {
    return (currentYear - i).toString();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Captcha validation
    if (userCaptchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Invalid Captcha code. Please enter the characters shown.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        // 1. Only create/register the account in DB
        await register(email, password, fullName);
        setSuccessMessage('Account created successfully! Please enter your password to log in.');
        setJustRegistered(true);
        setMode('login');
        setPassword('');
        setUserCaptchaInput('');
        refreshCaptcha();
        return;
      }

      // 2. Explicit login
      const user = await login(email, password);
      const formattedDob = `${birthYear}-${birthMonth}-${birthDay}`;
      
      onAuthenticated(user, justRegistered ? {
        gender,
        birthDate: formattedDob,
        birthPlace,
        birthTime: birthTime.trim() || undefined,
      } : undefined);

      if (onClose) onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto transition-opacity"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${mode === 'register' ? 'max-w-lg sm:max-w-2xl' : 'max-w-md'} rounded-t-2xl sm:rounded-2xl border shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto my-0 sm:my-auto transition-all duration-300 ${
            isDark
              ? 'bg-[#141418] border-[#C9A050]/40 text-[#E5E1D8]'
              : 'bg-[#FFFFFF] border-[#C9A050]/40 text-[#0D0D0F]'
          }`}
        >
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`absolute top-3.5 right-3.5 p-1.5 rounded-full transition-colors cursor-pointer z-10 ${
                isDark
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-black/10 text-gray-600 hover:text-black'
              }`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="p-4 sm:p-5 pb-1 flex flex-col items-center text-center shrink-0">
            <AncientTraditionLogo size="sm" isLight={!isDark} className="mb-1" />
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-wide flex items-center">
              JYOTISH<span className="text-[#C9A050]">VEDA</span>
            </h2>
            <p className={`text-[11px] mt-0.5 font-medium ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
              {mode === 'login' ? 'Welcome back! Log in to continue.' : 'Create your account to unlock personalized astrological insights.'}
            </p>
          </div>

          <div className="p-4 sm:p-5 pt-2">
            {/* Google Authentication Button */}
            <div className="mb-3 flex flex-col items-center">
              <button
                type="button"
                onClick={handleGoogleButtonClick}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] ${
                  isDark
                    ? 'bg-[#1C1C22] border-[#2A2A2E] text-[#F0ECE1] hover:bg-[#25252B] hover:border-[#C9A050]/50'
                    : 'bg-[#FFFFFF] border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#FAF8F2] hover:border-[#C9A050]/50'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{mode === 'login' ? 'Continue with Google' : 'Register with Google'}</span>
              </button>

              <div className="relative w-full my-2.5 flex items-center justify-center">
                <div className={`w-full border-t ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`} />
                <span className={`absolute px-2.5 text-[9px] uppercase font-bold tracking-wider ${isDark ? 'bg-[#141418] text-[#9E9A90]' : 'bg-[#FFFFFF] text-gray-400'}`}>
                  or continue with email
                </span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className={`flex mb-3 p-1 rounded-xl border shrink-0 ${
              isDark
                ? 'bg-[#0D0D0F] border-[#2A2A2E]'
                : 'bg-[#F9F7F1] border-[#E5E1D8]'
            }`}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); refreshCaptcha(); }}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                    : isDark ? 'text-[#9E9A90] hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); setSuccessMessage(null); refreshCaptcha(); }}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                    : isDark ? 'text-[#9E9A90] hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Register
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {googleSelectedAccount && mode === 'register' && (
                <div className={`p-2 px-3 rounded-xl border flex items-center justify-between transition-all ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  <div className="flex items-center space-x-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">Google Account Linked: <span className="font-normal opacity-90">{googleSelectedAccount.email}</span></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSelectedAccount(null);
                      setIsGoogleModalOpen(true);
                    }}
                    className="text-[10px] underline ml-2 shrink-0 opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              {mode === 'register' ? (
                /* Registration 2-Column Compact Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                  {/* Full Name */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-1.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                        placeholder="e.g. Keya Biswas"
                      />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A050] cursor-pointer ${
                        isDark
                          ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white'
                          : 'bg-[#F9F7F1] border-[#E5E1D8] text-black'
                      }`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Other</option>
                    </select>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-1.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Date of Birth Dropdown (Day, Month, Year) */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 flex items-center space-x-1 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      <Calendar className="w-3 h-3" />
                      <span>Date of Birth</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {/* Day */}
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className={`w-full px-1 py-1.5 border rounded-xl text-[11px] font-bold focus:outline-none focus:border-[#C9A050] cursor-pointer ${
                          isDark ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white' : 'bg-[#F9F7F1] border-[#E5E1D8] text-black'
                        }`}
                      >
                        {days.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      {/* Month */}
                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className={`w-full px-1 py-1.5 border rounded-xl text-[10px] font-bold focus:outline-none focus:border-[#C9A050] cursor-pointer ${
                          isDark ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white' : 'bg-[#F9F7F1] border-[#E5E1D8] text-black'
                        }`}
                      >
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value}>{m.name.slice(0, 3)}</option>
                        ))}
                      </select>

                      {/* Year */}
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className={`w-full px-1 py-1.5 border rounded-xl text-[11px] font-bold focus:outline-none focus:border-[#C9A050] cursor-pointer ${
                          isDark ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white' : 'bg-[#F9F7F1] border-[#E5E1D8] text-black'
                        }`}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-1.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                        placeholder="Min. 8 characters"
                      />
                    </div>
                  </div>

                  {/* Birth Place Manual Input */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 flex items-center space-x-1 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      <MapPin className="w-3 h-3" />
                      <span>Birth Place</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="e.g. Kolkata, West Bengal, India"
                        className={`w-full pl-8 pr-2.5 py-1.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Time of Birth (Optional) */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 flex items-center justify-between ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Birth Time</span>
                      </span>
                      <span className="text-[9px] font-normal opacity-70">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-1.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                        placeholder="e.g. 14:30 or 02:30 PM"
                      />
                    </div>
                  </div>

                  {/* Captcha Section (Full Width Span 2) */}
                  <div className="sm:col-span-2 pt-0.5">
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Security Verification (Captcha)
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`flex items-center justify-between px-2.5 py-1 rounded-xl border select-none tracking-[0.25em] font-mono text-sm font-extrabold italic shadow-inner ${
                          isDark
                            ? 'bg-[#0D0D0F] border-[#C9A050]/50 text-[#C9A050]'
                            : 'bg-[#F3EFE6] border-[#C9A050]/60 text-[#8C6B28]'
                        }`}
                      >
                        <span className="line-through decoration-[#C9A050]/60 decoration-2">
                          {captchaCode}
                        </span>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="ml-1.5 p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-gray-400 hover:text-[#C9A050]"
                          title="Generate new captcha"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="relative flex-1">
                        <ShieldCheck className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={userCaptchaInput}
                          onChange={(e) => setUserCaptchaInput(e.target.value)}
                          className={`w-full pl-8 pr-2.5 py-1.5 border rounded-xl text-xs font-semibold tracking-wider focus:outline-none focus:border-[#C9A050] ${
                            isDark
                              ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                              : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                          }`}
                          placeholder="Enter code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Login 1-Column View */
                <div className="space-y-2.5">
                  {/* Email Address */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#C9A050] ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                            : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                        }`}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Captcha Section */}
                  <div>
                    <label className={`block text-[10px] font-bold mb-0.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}>
                      Security Verification (Captcha)
                    </label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border select-none tracking-[0.25em] font-mono text-sm font-extrabold italic shadow-inner ${
                          isDark
                            ? 'bg-[#0D0D0F] border-[#C9A050]/50 text-[#C9A050]'
                            : 'bg-[#F3EFE6] border-[#C9A050]/60 text-[#8C6B28]'
                        }`}
                      >
                        <span className="line-through decoration-[#C9A050]/60 decoration-2">
                          {captchaCode}
                        </span>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="ml-1.5 p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-gray-400 hover:text-[#C9A050]"
                          title="Generate new captcha"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative flex-1">
                        <ShieldCheck className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={userCaptchaInput}
                          onChange={(e) => setUserCaptchaInput(e.target.value)}
                          className={`w-full pl-8 pr-2.5 py-2 border rounded-xl text-xs font-semibold tracking-wider focus:outline-none focus:border-[#C9A050] ${
                            isDark
                              ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white placeholder-gray-500'
                              : 'bg-[#F9F7F1] border-[#E5E1D8] text-black placeholder-gray-400'
                          }`}
                          placeholder="Enter code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className={`text-[11px] rounded-xl px-3 py-2 font-medium flex items-center space-x-2 border transition-all ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-2.5 py-1.5 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#A37B2F] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#C9A050]/20 disabled:opacity-60 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{mode === 'login' ? 'Log In to Continue' : 'Create Free Account'}</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Google Account Selector Dialog (Exact Google Account Chooser UI) */}
      {isGoogleModalOpen && (
        <div 
          onClick={() => setIsGoogleModalOpen(false)}
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-[24px] border shadow-2xl p-6 sm:p-7 relative overflow-hidden bg-[#1F1F1F] border-[#303030] text-[#E3E3E3]"
          >
            {/* Close button */}
            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google G Logo */}
            <div className="mb-4">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            </div>

            {/* Header */}
            <h3 className="text-xl sm:text-2xl font-normal text-white mb-1">Choose an account</h3>
            <p className="text-xs text-gray-400 mb-5">to continue to <strong className="text-white font-medium">JyotishVeda Platform</strong></p>

            {googleAuthError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{googleAuthError}</span>
              </div>
            )}

            {/* Account Chooser List */}
            <div className="divide-y divide-[#333333] border-y border-[#333333] mb-4 max-h-[300px] overflow-y-auto scrollbar-thin">
              {USER_GOOGLE_ACCOUNTS.map((account) => {
                const isThisLoading = loading && selectedAccountId === account.id;

                return (
                  <div
                    key={account.id}
                    onClick={() => !loading && handleGoogleSuccess(account.email, account.name, account.id)}
                    className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-[#2D2E30] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${account.avatarBg} text-white font-medium text-sm flex items-center justify-center shrink-0 shadow`}>
                        {account.initial}
                      </div>
                      
                      {/* Name & Email */}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white group-hover:text-white truncate">
                          {account.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {account.email}
                        </div>
                      </div>
                    </div>

                    {/* Status or Spinner */}
                    <div className="shrink-0 ml-3">
                      {isThisLoading ? (
                        <Loader2 className="w-4 h-4 text-[#C9A050] animate-spin" />
                      ) : account.status ? (
                        <span className="text-[11px] text-gray-500">{account.status}</span>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Use Another Account */}
              {!showOtherAccountInput ? (
                <div
                  onClick={() => setShowOtherAccountInput(true)}
                  className="flex items-center space-x-3.5 py-3 px-2 -mx-2 rounded-lg hover:bg-[#2D2E30] transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center text-gray-400 group-hover:text-white shrink-0">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-300 group-hover:text-white font-medium">
                    Use another account
                  </div>
                </div>
              ) : (
                <div className="py-3 px-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (googleEmailInput.trim()) {
                        handleGoogleSuccess(googleEmailInput.trim(), googleNameInput.trim() || 'Google User', 'custom');
                      }
                    }}
                    className="space-y-2.5"
                  >
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#2D2E30] border border-[#3C4043] text-white focus:outline-none focus:border-[#C9A050]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#2D2E30] border border-[#3C4043] text-white focus:outline-none focus:border-[#C9A050]"
                    />
                    <div className="flex space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOtherAccountInput(false)}
                        className="py-1.5 px-3 text-xs rounded-lg border border-gray-600 text-gray-400 hover:text-white cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !googleEmailInput.trim()}
                        className="flex-1 py-1.5 bg-[#C9A050] text-[#0D0D0F] font-bold text-xs rounded-lg hover:bg-[#D4AF37] transition disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1"
                      >
                        {loading && selectedAccountId === 'custom' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Continue</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <p className="text-[11px] text-gray-400 leading-relaxed">
              To continue, Google will share your name, email address, language preference, and profile picture with JyotishVeda.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
