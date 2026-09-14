import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  Trash2,
  Plus,
  History,
  Pencil,
  X,
  Loader2,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, ChatMessage, HoroscopeTradition, NumerologyReport } from '../types';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { getTranslation } from '../services/translations';
import { API_ENDPOINTS } from '../config/api_config';
import { API_BASE_URL } from '../services/api';
import * as counsellingApi from '../services/counsellingApi';
import { generateAIResponse, clearChatHistory } from '../services/aiChatService';

interface AICounsellorChatProps {
  profile: UserProfile;
  tradition: HoroscopeTradition;
  chartData: any;
  numerology: NumerologyReport;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  language?: string;
  isAuthenticated?: boolean;
  theme?: 'light' | 'dark';
}

export const AICounsellorChat: React.FC<AICounsellorChatProps> = ({
  profile,
  tradition,
  chartData,
  numerology,
  messages,
  setMessages,
  language = 'en',
  isAuthenticated,
  theme = 'dark',
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---- Session management (backend-persisted, only when logged in) ----
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<counsellingApi.AISession[]>([]);
  const [isSessionsPanelOpen, setIsSessionsPanelOpen] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const loadSessions = () => {
    if (!isAuthenticated) return;
    counsellingApi
      .listSessions()
      .then((all) => setSessions(all.filter((s) => s.profileId === profile.id)))
      .catch((err) => console.warn('Could not load AI sessions:', err));
  };

  // Always start with a clean, fresh consultation session on mount or profile switch
  useEffect(() => {
    loadSessions();
    setActiveSessionId(null);
    setMessages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile.id]);

  const handleNewConsultation = () => {
    setActiveSessionId(null);
    setMessages([]);
    setIsSessionsPanelOpen(false);
  };

  const handleContinueSession = async (session: counsellingApi.AISession) => {
    setIsSessionsPanelOpen(false);
    setActiveSessionId(session.id);
    try {
      const history = await counsellingApi.getMessages(session.id);
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
      );
    } catch (err) {
      console.error('Could not load session messages:', err);
    }
  };

  const handleRenameSession = async (id: string) => {
    if (!renameValue.trim()) return;
    try {
      await counsellingApi.renameSession(id, renameValue.trim());
      setRenamingSessionId(null);
      loadSessions();
    } catch (err) {
      console.error('Could not rename session:', err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await counsellingApi.deleteSession(id);
      if (activeSessionId === id) handleNewConsultation();
      loadSessions();
    } catch (err) {
      console.error('Could not delete session:', err);
    }
  };

  const t = (key: string) => getTranslation(key, language);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Send Message (calling new AI_response controller API)
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Build chat turns for context memory
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role === 'user' ? 'User' : 'Assistant',
      content: m.content,
    }));

    try {
      const result = await generateAIResponse(
        text.trim(),
        historyPayload,
        profile.id,
        activeSessionId || undefined
      );

      const replyContent = Array.isArray(result.response)
        ? result.response.join('\n\n')
        : String(result.response || 'I am analyzing your celestial placements.');

      const assistantMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: result.suggested_questions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      loadSessions();
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      const isGuardrail = err?.message?.includes('This is not my content');

      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: isGuardrail
          ? '⚠️ This is not my content, I am an astro AI. Please ask questions related to astrology, horoscopes, planets, or numerology.'
          : (err?.message || 'A momentary celestial calculation variance occurred. Please try asking again.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);

    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      ur: 'ur-PK',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ja: 'ja-JP',
      es: 'es-ES',
      zu: 'zu-ZA',
      en: 'en-US',
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? profile.fullName : 'Daivajna'}:\n${m.content}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vedic_Consultation_${profile.fullName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
  };

  const handleClearHistory = async () => {
    if (confirm('Clear consultation session history and transcript from database?')) {
      try {
        await clearChatHistory(profile.id, activeSessionId || undefined);
        setMessages([]);
      } catch (e) {
        console.warn('Could not clear remote history, resetting local state:', e);
        setMessages([]);
      }
    }
  };

  return (
    <div className="space-y-4 w-full font-sans">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <AncientTraditionLogo size="md" isLight={theme === 'light'} />
          <div>
            <h2 className="text-base font-bold text-[#F0ECE1] flex items-center space-x-2">
              <span>{t('counsellor.title')}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] tracking-wider bg-[#C9A050]/20 text-[#C9A050] font-semibold border border-[#C9A050]/30 uppercase">
                Active & Grounded
              </span>
            </h2>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              Live consultation grounded in {profile.fullName}’s chart ({chartData?.ascendant?.signName || 'Vedic'} Lagna, Mulank {numerology.mulank})
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 self-end sm:self-auto relative">
          {isAuthenticated && (
            <>
              <button
                onClick={handleNewConsultation}
                className="p-2 px-3 rounded-lg bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] transition cursor-pointer text-xs flex items-center space-x-1.5"
                title="Start a New Consultation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Consultation</span>
              </button>
              <button
                onClick={() => {
                  loadSessions();
                  setIsSessionsPanelOpen((v) => !v);
                }}
                className="p-2 px-3 rounded-lg bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] transition cursor-pointer text-xs flex items-center space-x-1.5"
                title="Past Consultations"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sessions</span>
              </button>

              {isSessionsPanelOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#141418] border border-[#2A2A2E] rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="p-4 text-xs text-[#9E9A90] text-center">No saved consultations yet for this profile.</div>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between px-3 py-2.5 border-b border-[#2A2A2E] last:border-0 hover:bg-[#1A1A1E] transition ${
                          activeSessionId === s.id ? 'bg-[#1A1A1E]' : ''
                        }`}
                      >
                        {renamingSessionId === s.id ? (
                          <div className="flex items-center space-x-1.5 flex-1">
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleRenameSession(s.id)}
                              className="flex-1 bg-[#0D0D0F] border border-[#2A2A2E] rounded px-2 py-1 text-xs text-[#F0ECE1] focus:outline-none focus:border-[#C9A050]"
                            />
                            <button onClick={() => handleRenameSession(s.id)} className="text-[#C9A050] cursor-pointer">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setRenamingSessionId(null)} className="text-[#9E9A90] cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleContinueSession(s)}
                              className="flex-1 text-left cursor-pointer"
                            >
                              <div className="text-xs font-semibold text-[#E5E1D8] truncate">{s.title}</div>
                              <div className="text-[10px] text-[#9E9A90]">{s.messageCount} messages</div>
                            </button>
                            <div className="flex items-center space-x-1 shrink-0 ml-2">
                              <button
                                onClick={() => {
                                  setRenamingSessionId(s.id);
                                  setRenameValue(s.title);
                                }}
                                className="p-1 text-[#9E9A90] hover:text-[#C9A050] cursor-pointer"
                                title="Rename"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSession(s.id)}
                                className="p-1 text-[#9E9A90] hover:text-rose-400 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          <button
            onClick={handleExportTranscript}
            className="p-2 px-3 rounded-lg bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] transition cursor-pointer text-xs flex items-center space-x-1.5"
            title="Export Consultation Transcript"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('action.download')}</span>
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-lg bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] transition cursor-pointer text-xs"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-3.5 sm:p-6 text-[#E5E1D8] shadow-xl min-h-[380px] sm:min-h-[480px] max-h-[65vh] sm:max-h-[600px] overflow-y-auto flex flex-col space-y-3.5 sm:space-y-4 touch-pan-y"
      >
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A050]/10 border border-[#C9A050]/30 flex items-center justify-center text-[#C9A050]">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#F0ECE1]">{t('counsellor.title')}</h3>
            <p className="text-xs text-[#9E9A90] max-w-md leading-relaxed">
              {t('counsellor.subtitle')}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                      : 'bg-[#1A1A1E] text-[#C9A050] border border-[#C9A050]/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-xl p-4 max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-md space-y-2.5 ${
                    isUser
                      ? 'bg-[#C9A050] text-[#0D0D0F] font-medium rounded-tr-none'
                      : 'bg-[#1C1C22] text-[#E5E1D8] border border-[#2A2A2E] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Interactive Suggested Questions Chips (for Assistant) */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="pt-2.5 border-t border-[#2A2A2E]/60 space-y-1.5 mt-2">
                      <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#C9A050]">
                        <HelpCircle className="w-3.5 h-3.5 text-[#C9A050]" />
                        <span>Suggested Follow-Up Questions:</span>
                      </div>
                      <div className="flex flex-col gap-1.5 pt-1">
                        {msg.suggestedQuestions.map((sq, sqIdx) => (
                          <button
                            key={sqIdx}
                            onClick={() => handleSendMessage(sq)}
                            disabled={isLoading}
                            className="group text-left text-xs px-3 py-2 rounded-lg bg-[#141418] hover:bg-[#C9A050]/15 border border-[#2A2A2E] hover:border-[#C9A050]/40 text-[#E5E1D8] hover:text-[#F0ECE1] transition cursor-pointer flex items-center justify-between space-x-2"
                          >
                            <div className="flex items-center space-x-2 overflow-hidden">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050] shrink-0 group-hover:scale-125 transition" />
                              <span className="truncate">{sq}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#9E9A90] group-hover:text-[#C9A050] shrink-0 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions for Assistant messages */}
                  {!isUser && (
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#2A2A2E]/50 text-xs text-[#9E9A90]">
                      <button
                        onClick={() => handleSpeech(msg.id, msg.content)}
                        className="hover:text-[#C9A050] transition cursor-pointer p-1"
                        title="Text-to-Speech Voice"
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-[#C9A050] transition cursor-pointer p-1"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-[10px] text-[#9E9A90]">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-xs text-[#C9A050]">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1E] border border-[#C9A050]/30 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin text-[#C9A050]" />
            </div>
            <div className="bg-[#1C1C22] p-3 rounded-xl border border-[#2A2A2E] text-xs text-[#9E9A90] flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A050] animate-pulse" />
              <span>Daivajna is consulting classical ephemeris & formulating astrological guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-2.5 shadow-xl flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('counsellor.placeholder')}
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 text-[#F0ECE1] placeholder-[#9E9A90] focus:outline-none text-xs sm:text-sm px-3"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A050] to-[#8C6D2E] hover:from-[#D4AF37] hover:to-[#A07828] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('counsellor.send')}</span>
        </button>
      </form>
    </div>
  );
};
