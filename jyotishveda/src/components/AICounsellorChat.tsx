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
} from 'lucide-react';
import { UserProfile, ChatMessage, HoroscopeTradition, NumerologyReport } from '../types';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { getTranslation } from '../services/translations';
import { API_ENDPOINTS } from '../config/api_config';
import { API_BASE_URL } from '../services/api';
import * as counsellingApi from '../services/counsellingApi';
import { ApiError } from '../services/api';

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

const PRESET_QUESTIONS: Record<string, string[]> = {
  en: [
    'When will my career reach its next major breakthrough based on my 10th house & dasha?',
    'Analyze my relationship harmony, 7th house lord, and auspicious marriage timing.',
    'What are the strongest Raja Yogas or Dhana Yogas in my birth chart?',
    'Do I have Manglik Dosha or Sade Sati, and what authentic Vedic remedies should I perform?',
    'Which gemstone or rudraksha is most auspicious for my Lagna & Mulank?',
    'Should I pursue independent entrepreneurship or remain in corporate leadership?',
  ],
  hi: [
    'मेरी १०वें भाव और दशा के अनुसार मेरे करियर में अगली बड़ी सफलता कब आएगी?',
    'मेरे सप्तमेश और विवाह के शुभ समय का विश्लेषण करें।',
    'मेरी कुंडली में कौन से राजयोग या धनयोग सबसे प्रबल हैं?',
    'क्या मेरी कुंडली में मांगलिक दोष या साढ़ेसाती है, और इसके प्रामाणिक उपाय क्या हैं?',
    'मेरे लग्न और मूलांक के लिए कौन सा रत्न सबसे शुभ है?',
  ],
  es: [
    '¿Cuándo alcanzará mi carrera su próximo gran avance según mi casa 10 y dasha?',
    'Analiza la armonía de mis relaciones y el momento propicio para el matrimonio.',
    '¿Cuáles son los Raja Yogas o Dhana Yogas más fuertes en mi carta natal?',
    '¿Qué gema o amuleto es más propicio para mi signo ascendente y numerología?',
  ],
  fr: [
    'Quand ma carrière connaîtra-t-elle sa prochaine percée selon ma maison 10 et dasha?',
    'Analysez l’harmonie de mes relations et le moment propice au mariage.',
    'Quels sont les Raja Yogas les plus puissants dans mon thème natal?',
    'Quelle pierre précieuse est la plus bénéfique pour mon ascendant?',
  ],
  de: [
    'Wann wird meine Karriere laut meinem 10. Haus und Dasha den nächsten Durchbruch erzielen?',
    'Analysieren Sie meine Beziehungsharmonie und den günstigen Zeitpunkt für eine Heirat.',
    'Welche starken Raja Yogas oder Dhana Yogas sind in meinem Geburtshoroskop vorhanden?',
  ],
  zh: [
    '根据我的第十宫和当前大运(Dasha)，我的事业何时会迎来下一次重大突破？',
    '分析我的第七宫与正缘婚配契机及吉利时机。',
    '我的星盘中有哪些最强劲的富贵吉相(Raja/Dhana Yoga)？',
    '最契合我本命盘的开运宝石是哪种？',
  ],
  ja: [
    '私の第10室と現在のダシャー周期に基づき、キャリアの転機はいつ訪れますか？',
    '私の第7室とパートナーシップ・良縁の時期を分析してください。',
    '私の出生図にある最も強力な吉相（ラージャ・ヨーガ）は何ですか？',
  ],
  ur: [
    'میرے دسویں گھر اور فعال دشا کے مطابق کیریئر میں اگلی بڑی کامیابی کب حاصل ہوگی؟',
    'میرے ساتویں گھر کے حاکم اور شادی کے موافق وقت کا تفصیلی جائزہ لیں۔',
    'میرے زائچہ میں کون سے راج یوگ سب سے طاقتور ہیں اور کیا تدابیر اختیار کرنی چاہئیں؟',
  ],
  zu: [
    'Umsebenzi wami uzofinyelela nini esigabeni esiphezulu ngokuya ngendlu yami ye-10?',
    'Hlaziya ukuvumelana kobudlelwano bami nesikhathi esihle somshado.',
    'Yiliphi itshe eliyigugu elilungele impilo yami?',
  ],
};

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

  const buildChartSummary = (): string => {
    if (!chartData) return '';
    const asc = chartData.ascendant;
    return asc
      ? `Ascendant: ${asc.signName} ${asc.degree}°, Nakshatra: ${asc.nakshatra}. System: ${chartData.systemTitle}.`
      : '';
  };

  const buildNumerologySummary = (): string =>
    `Mulank ${numerology.mulank} (${numerology.mulankPlanet}), Bhagyank ${numerology.bhagyank}, Chaldean Namank ${numerology.namankChaldean}.`;

  const t = (key: string) => getTranslation(key, language);
  const activeQuestions = PRESET_QUESTIONS[language] || PRESET_QUESTIONS['en'];

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

    if (isAuthenticated) {
      try {
        let sessionId = activeSessionId;
        if (!sessionId) {
          const session = await counsellingApi.createSession(
            profile.id,
            tradition,
            text.trim().slice(0, 60),
          );
          sessionId = session.id;
          setActiveSessionId(sessionId);
        }

        const { message: assistantMsg } = await counsellingApi.sendMessage(
          sessionId,
          text.trim(),
          buildChartSummary(),
          buildNumerologySummary(),
        );

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsg.id,
            role: 'assistant',
            content: assistantMsg.content,
            timestamp: new Date(assistantMsg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
        loadSessions();
      } catch (err) {
        // Surface the real error — never fabricate a reply when the LLM
        // is unavailable or misconfigured.
        const message =
          err instanceof ApiError
            ? err.message
            : 'Could not reach the AI counsellor service. Please try again.';
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Not logged in — fall back to the demo Gemini proxy, unchanged.
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUNSELLOR.DEFAULT_MESSAGES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          profile,
          tradition,
          chartData,
          numerology,
          language,
        }),
      });

      const data = await res.json();
      const replyContent = data.response || data.reply || data.interpretation || 'I am analyzing your celestial placements. Please inquire further.';

      const assistantMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'A momentary celestial calculation variance occurred. Please try asking again.',
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
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? profile.fullName : 'AI Daivajna'}:\n${m.content}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vedic_Consultation_${profile.fullName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
  };

  const handleClearHistory = () => {
    if (confirm('Clear consultation session transcript?')) {
      setMessages([]);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
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
              Live consultation grounded in {profile.fullName}’s chart ({chartData?.ascendant?.signName} Lagna, Mulank {numerology.mulank})
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

      {/* Preset Question Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-[#C9A050] font-semibold shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('counsellor.suggested')}</span>
        </span>
        {activeQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-[#1A1A1E] hover:bg-[#C9A050]/20 border border-[#2A2A2E] hover:border-[#C9A050]/40 text-[#9E9A90] hover:text-[#C9A050] whitespace-nowrap transition cursor-pointer shrink-0 text-xs disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-4 sm:p-6 text-[#E5E1D8] shadow-xl min-h-[480px] max-h-[600px] overflow-y-auto flex flex-col space-y-4"
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
                  className={`rounded-xl p-4 max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-md space-y-2 ${
                    isUser
                      ? 'bg-[#C9A050] text-[#0D0D0F] font-medium rounded-tr-none'
                      : 'bg-[#1C1C22] text-[#E5E1D8] border border-[#2A2A2E] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

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
              <span>AI Daivajna is analyzing ephemeris transits & natal alignments...</span>
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
