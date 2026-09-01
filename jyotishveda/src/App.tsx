import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { AuthGate } from './components/AuthGate';
import { LandingPage } from './components/LandingPage';
import { DailyHoroscopeView } from './components/DailyHoroscopeView';
import { HoroscopeTraditionsView } from './components/HoroscopeTraditionsView';
import { GlobalZodiacView } from './components/GlobalZodiacView';
import { MatchmakingView } from './components/MatchmakingView';
import { NumerologyView } from './components/NumerologyView';
import { AICounsellorChat } from './components/AICounsellorChat';
import { LifeRoadmapView } from './components/LifeRoadmapView';
import { ConsultationsPaymentView } from './components/ConsultationsPaymentView';
import { AdminKGraphView } from './components/AdminKGraphView';
import { AdminBlogsView } from './components/AdminBlogsView';
import PanjikaCalendarView from './components/PanjikaCalendarView';

import { API_ENDPOINTS } from './config/api_config';
import { API_BASE_URL } from './services/api';
import { ProfileModal } from './components/ProfileModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { Footer } from './components/Footer';
import { StarfieldBackground } from './components/StarfieldBackground';
import { motion, AnimatePresence } from 'framer-motion';

import {
  UserProfile,
  HoroscopeTradition,
  ChatMessage,
  PanchangInfo,
  LifeMilestone,
  ConsultationTier,
  KGraphNode,
  KGraphEdge,
  RunbookConfig,
} from './types';

import {
  calculateVedicChart,
  calculateDailyPanchang,
  calculateNumerology,
  DEFAULT_CONSULTATION_TIERS,
  DEFAULT_ROADMAP,
} from './services/astroEngine';

import {
  INITIAL_KGRAPH_NODES,
  INITIAL_KGRAPH_EDGES,
  INITIAL_RUNBOOKS,
} from './services/kGraphData';

import { getToken, clearToken } from './services/api';
import {
  getCurrentUser,
  logout as logoutRequest,
  AuthUser,
} from './services/authApi';
import * as profileApi from './services/profileApi';

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile-1',
    fullName: 'Aarav Sharma',
    gender: 'male',
    birthDate: '1995-06-15',
    birthTime: '07:30',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    focusAreas: [
      'Career & Executive Leadership',
      'Wealth, Investments & Business',
    ],
    notes:
      'Planning global tech expansion and career milestone promotion.',
    createdAt: new Date().toISOString(),
    isPremium: true,
    horoscopeSystem: 'vedic',
  },
  {
    id: 'profile-2',
    fullName: 'Priya Patel',
    gender: 'female',
    birthDate: '1998-11-22',
    birthTime: '14:45',
    birthPlace: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
    focusAreas: [
      'Marriage, Love & Kundli Milan',
      'Spiritual Dharma & Moksha',
    ],
    notes:
      'Looking for auspicious marriage timing and business partnership compatibility.',
    createdAt: new Date().toISOString(),
    isPremium: false,
    horoscopeSystem: 'western',
  },
];

export function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // On load, if a token exists, verify it's still valid before showing the app.
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setAuthChecked(true);
      return;
    }

    getCurrentUser()
      .then((user) => setAuthUser(user))
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = () => {
    logoutRequest();
    setAuthUser(null);
  };

  const [activeTab, setActiveTab] = useState<string>('daily');

  // Scroll to top when navigating between pages/tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [tradition, setTradition] =
    useState<HoroscopeTradition>('parashari');

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('jyotish_profiles');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });

  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    return profiles[0] || DEFAULT_PROFILES[0];
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  // Language state
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('jyotish_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('jyotish_language', language);
  }, [language]);

  // Theme Management (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('jyotish_theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('jyotish_theme', theme);

    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 10-Year Roadmap
  const [roadmap, setRoadmap] =
    useState<LifeMilestone[]>(DEFAULT_ROADMAP);

  // Admin K-Graph & Runbooks
  const [kGraphNodes, setKGraphNodes] =
    useState<KGraphNode[]>(INITIAL_KGRAPH_NODES);

  const [kGraphEdges, setKGraphEdges] =
    useState<KGraphEdge[]>(INITIAL_KGRAPH_EDGES);

  const [runbooks, setRunbooks] =
    useState<RunbookConfig[]>(INITIAL_RUNBOOKS);

  // Save profiles to localStorage
  useEffect(() => {
    localStorage.setItem(
      'jyotish_profiles',
      JSON.stringify(profiles)
    );
  }, [profiles]);

  // Once logged in, load the user's real saved profiles from the backend.
  useEffect(() => {
    if (!authUser) return;

    profileApi
      .fetchProfiles()
      .then((remoteProfiles) => {
        if (remoteProfiles.length > 0) {
          setProfiles(remoteProfiles);
          setCurrentProfile(remoteProfiles[0]);
        } else {
          // If no profiles exist, use a default but with the user's actual name
          const newProfile = {
            ...DEFAULT_PROFILES[0],
            fullName: authUser.fullName,
            id: 'profile-new',
          };

          setProfiles([newProfile]);
          setCurrentProfile(newProfile);
        }
      })
      .catch((err) => {
        // Backend unreachable or empty — keep local cache so the demo still works.
        console.warn(
          'Could not load profiles from server:',
          err
        );
      });
  }, [authUser]);

  // Derived Astrological & Numerological Data
  const [chartData, setChartData] = useState(() =>
    calculateVedicChart(currentProfile)
  );

  useEffect(() => {
    let active = true;

    const loadRealChart = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.BIRTH_CHART.GENERATE}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentProfile),
          }
        );

        const data = await response.json();

        if (
          data &&
          data.status === 'success' &&
          active
        ) {
          const fullChart = calculateVedicChart(
            currentProfile,
            data.data
          );

          setChartData(fullChart);
        }
      } catch (err) {
        console.error(
          'Failed to load real ephemeris data',
          err
        );

        if (active) {
          setChartData(
            calculateVedicChart(currentProfile)
          );
        }
      }
    };

    // Set immediate fallback on profile change, then fetch
    setChartData(calculateVedicChart(currentProfile));
    loadRealChart();

    return () => {
      active = false;
    };
  }, [currentProfile]);

  const [panchang, setPanchang] = useState<PanchangInfo>(() =>
    calculateDailyPanchang(
      currentProfile.latitude,
      currentProfile.longitude
    )
  );

  useEffect(() => {
    let active = true;

    const loadRealPanchang = async () => {
      try {
        const now = new Date();

        const dateStr =
          now.getFullYear() +
          '-' +
          String(now.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(now.getDate()).padStart(2, '0');

        const timeStr =
          String(now.getHours()).padStart(2, '0') +
          ':' +
          String(now.getMinutes()).padStart(2, '0');

        const tzOffset =
          -now.getTimezoneOffset() / 60;

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.INSIGHTS.PANCHANG}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: dateStr,
              time: timeStr,
              timezone: tzOffset,
            }),
          }
        );

        const result = await response.json();

        if (
          result &&
          result.status === 'success' &&
          active
        ) {
          const realPanchang =
            calculateDailyPanchang(
              currentProfile.latitude,
              currentProfile.longitude,
              result.data
            );

          setPanchang(realPanchang);
        }
      } catch (err) {
        console.error(
          'Failed to load real panchang data',
          err
        );

        if (active) {
          setPanchang(
            calculateDailyPanchang(
              currentProfile.latitude,
              currentProfile.longitude
            )
          );
        }
      }
    };

    setPanchang(
      calculateDailyPanchang(
        currentProfile.latitude,
        currentProfile.longitude
      )
    );

    loadRealPanchang();

    return () => {
      active = false;
    };
  }, [
    currentProfile.latitude,
    currentProfile.longitude,
  ]);

  const numerology = useMemo(() => {
    return calculateNumerology(
      currentProfile.fullName,
      currentProfile.birthDate
    );
  }, [
    currentProfile.fullName,
    currentProfile.birthDate,
  ]);

  const handleSaveProfile = (
    newProfile: UserProfile
  ) => {
    const existingIndex = profiles.findIndex(
      (p) => p.id === newProfile.id
    );

    const isExisting =
      existingIndex >= 0 &&
      !newProfile.id.startsWith('profile-draft-');

    // Optimistic local update so the UI feels instant.
    if (isExisting) {
      const updated = [...profiles];
      updated[existingIndex] = newProfile;

      setProfiles(updated);
      setCurrentProfile(newProfile);
    } else {
      setProfiles([newProfile, ...profiles]);
      setCurrentProfile(newProfile);
    }

    if (!authUser) return;

    const { id, createdAt, ...payload } = newProfile;

    const persist = isExisting
      ? profileApi.updateProfile(id, payload)
      : profileApi.createProfile(payload);

    persist
      .then((saved) => {
        setProfiles((prev) => {
          const idx = prev.findIndex(
            (p) =>
              p.id === newProfile.id ||
              p.id === saved.id
          );

          if (idx === -1) {
            return [saved, ...prev];
          }

          const next = [...prev];
          next[idx] = saved;

          return next;
        });

        setCurrentProfile((prev) =>
          prev.id === newProfile.id
            ? saved
            : prev
        );
      })
      .catch((err) => {
        console.error(
          'Could not save profile to server:',
          err
        );
      });
  };

  const handleAskAIForSign = (
    signName: string,
    promptText: string
  ) => {
    setActiveTab('counsellor');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    // Send to backend
    fetch(`${API_BASE_URL}${API_ENDPOINTS.COUNSELLOR.DEFAULT_MESSAGES}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: promptText,
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        profile: currentProfile,
        tradition,
        chartData,
        numerology,
        language,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const replyContent =
          data.response ||
          data.reply ||
          data.interpretation ||
          `Analysis complete for ${signName}.`;

        const assistantMessage: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          ),
        };

        setMessages((prev) => [
          ...prev,
          assistantMessage,
        ]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const isRtl = language === 'ur';

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    if (showAuthGate) {
      return (
        <div className="relative">
          <AuthGate
            onAuthenticated={setAuthUser}
            initialMode={authMode}
          />
          <button
            onClick={() => setShowAuthGate(false)}
            className="absolute top-6 left-6 text-sm text-[#9E9A90] hover:text-[#C9A050] transition cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      );
    }
    
    return (
      <LandingPage
        onLoginClick={() => { setAuthMode('login'); setShowAuthGate(true); }}
        onRegisterClick={() => { setAuthMode('register'); setShowAuthGate(true); }}
        onOpenDisclaimer={() => setIsDisclaimerModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col font-sans relative z-10 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-transparent text-[#E5E1D8] selection:bg-[#C9A050] selection:text-[#0D0D0F]'
          : 'light bg-[#F0ECE1] text-[#0D0D0F] selection:bg-[#D4AF37] selection:text-[#FFFFFF]'
      }`}
    >
      {/* Animated Space Background - Only in Dark Mode */}
      {theme === 'dark' && <StarfieldBackground />}

      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={setCurrentProfile}
        onOpenNewProfile={() =>
          setIsProfileModalOpen(true)
        }
        onOpenDisclaimer={() =>
          setIsDisclaimerModalOpen(true)
        }
        tradition={tradition}
        setTradition={setTradition}
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        onLogout={handleLogout}
        isAdmin={authUser?.role === 'admin'}
      />

      {/* Main Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -25,
            }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1], // Custom spring-like easing for a premium glide
            }}
            className="w-full"
          >
            {activeTab === 'daily' && (
              <DailyHoroscopeView
                profile={currentProfile}
                panchang={panchang}
                numerology={numerology}
                chartData={chartData}
                onNavigateToTab={setActiveTab}
                theme={theme}
              />
            )}

            {activeTab === 'panjika' && (
              <PanjikaCalendarView />
            )}

            {activeTab === 'zodiac' && (
              <GlobalZodiacView
                profile={currentProfile}
                chartData={chartData}
                language={language}
                onAskAIForSign={handleAskAIForSign}
                theme={theme}
              />
            )}

            {activeTab === 'horoscope' && (
              <HoroscopeTraditionsView
                profile={currentProfile}
                tradition={tradition}
                setTradition={setTradition}
                chartData={chartData}
                numerology={numerology}
                language={language}
              />
            )}

            {activeTab === 'matchmaking' && (
              <MatchmakingView
                currentProfile={currentProfile}
                profiles={profiles}
                language={language}
                isAuthenticated={!!authUser}
                theme={theme}
              />
            )}

            {activeTab === 'numerology' && (
              <NumerologyView
                profile={currentProfile}
                numerology={numerology}
                isAuthenticated={!!authUser}
              />
            )}

            {activeTab === 'counsellor' && (
              <AICounsellorChat
                profile={currentProfile}
                tradition={tradition}
                chartData={chartData}
                numerology={numerology}
                messages={messages}
                setMessages={setMessages}
                language={language}
                isAuthenticated={!!authUser}
                theme={theme}
              />
            )}

            {activeTab === 'roadmap' && (
              <LifeRoadmapView
                profile={currentProfile}
                tradition={tradition}
                chartData={chartData}
                numerology={numerology}
                roadmap={roadmap}
                setRoadmap={setRoadmap}
              />
            )}

            {activeTab === 'consultations' && (
              <ConsultationsPaymentView
                profile={currentProfile}
                tiers={DEFAULT_CONSULTATION_TIERS}
                theme={theme}
                onPaymentSuccess={(tier) => {
                  // Upgrade profile
                  const updatedProfile = {
                    ...currentProfile,
                    isPremium: true,
                  };

                  handleSaveProfile(updatedProfile);
                }}
              />
            )}

            {activeTab === 'blogs' && authUser?.role === 'admin' && (
              <AdminBlogsView theme={theme} />
            )}

            {activeTab === 'admin' && authUser?.role === 'admin' && (
              <AdminKGraphView
                nodes={kGraphNodes}
                setNodes={setKGraphNodes}
                edges={kGraphEdges}
                setEdges={setKGraphEdges}
                runbooks={runbooks}
                setRunbooks={setRunbooks}
                profiles={profiles}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Profile Creation / Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={currentProfile}
        theme={theme}
      />

      {/* Ethical & Astrological Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() =>
          setIsDisclaimerModalOpen(false)
        }
      />

      {/* Footer */}
      <Footer
        onOpenDisclaimer={() =>
          setIsDisclaimerModalOpen(true)
        }
        setActiveTab={setActiveTab}
        theme={theme}
        language={language}
      />
    </div>
  );
}

export default App;