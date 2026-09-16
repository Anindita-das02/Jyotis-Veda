import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  Server,
  Cloud,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  ExternalLink,
  Activity
} from 'lucide-react';
import { adminApi, LLMConfig, LLMTestResult } from '../services/adminApi';

interface AdminLLMConfigViewProps {
  theme: 'dark' | 'light';
}

type LLMProvider = 'mistral_local' | 'gemini' | 'mistral_cloud' | 'openai';

interface ProviderMeta {
  id: LLMProvider;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  accentColor: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'mistral_local',
    name: 'Mistral Local (Self-Hosted)',
    tagline: 'Ollama / vLLM Server',
    description: 'On-premises or custom cloud server running open-weights Mistral. Zero external API costs and full data privacy.',
    icon: Server,
    badge: 'Self-Hosted',
    accentColor: '#3B82F6',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Gemini 2.5 Flash / Pro',
    description: 'Ultra-fast multimodal model with excellent Bengali and Indic language fluency, high quota, and low latency.',
    icon: Sparkles,
    badge: 'Recommended',
    accentColor: '#10B981',
  },
  {
    id: 'mistral_cloud',
    name: 'Mistral Cloud API',
    tagline: 'Official Mistral AI API',
    description: 'Cloud-hosted Mistral Large/Small models directly from Mistral AI in Paris. High astrological synthesis accuracy.',
    icon: Cloud,
    badge: 'Cloud API',
    accentColor: '#F59E0B',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    tagline: 'GPT-4o / GPT-4o-mini',
    description: 'State-of-the-art reasoning and conversational depth. Supports custom base URLs for Azure or OpenAI proxies.',
    icon: Zap,
    badge: 'Industry Standard',
    accentColor: '#8B5CF6',
  },
];

export const AdminLLMConfigView: React.FC<AdminLLMConfigViewProps> = ({ theme }) => {
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('mistral_local');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password visibility states
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showMistralCloudKey, setShowMistralCloudKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  // Testing states
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, LLMTestResult>>({});

  // Editable form fields
  const [formData, setFormData] = useState<Partial<LLMConfig>>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminApi.getLLMConfig();
      setConfig(data);
      setSelectedProvider(data.ACTIVE_LLM || 'mistral_local');
      setFormData(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load LLM configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LLMConfig, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestConnection = async (provider: LLMProvider) => {
    setTestingProvider(provider);
    try {
      const res = await adminApi.testLLMConnection(provider, formData);
      setTestResults((prev) => ({
        ...prev,
        [provider]: res,
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          provider,
          status: 'error',
          message: err?.message || 'Connection test failed',
          latency_ms: 0,
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveAndActivate = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const payload: Partial<LLMConfig> = {
        ...formData,
        ACTIVE_LLM: selectedProvider,
      };

      const res = await adminApi.updateLLMConfig(payload);
      if (res?.settings) {
        setConfig(res.settings);
        setFormData(res.settings);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[55vh] space-y-4">
        <Activity className="w-10 h-10 text-[#C9A050] animate-spin" />
        <p className={`text-sm ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
          Loading AI engine configurations...
        </p>
      </div>
    );
  }

  const activeProviderMeta = PROVIDERS.find((p) => p.id === (config?.ACTIVE_LLM || 'mistral_local'));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Top Header & Status */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8] shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#C9A050]/15 rounded-2xl border border-[#C9A050]/30 text-[#C9A050]">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
                  AI Engine & <span className="text-[#C9A050]">LLM Control Center</span>
                </h1>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  সরাসরি অ্যাডমিন প্যানেল থেকে যেকোনো LLM সক্রিয় ও কনফিগার করুন (Zero Server Restart)
                </p>
              </div>
            </div>
          </div>

          {/* Current Live Active Provider Badge */}
          <div className={`px-5 py-3.5 rounded-2xl border flex items-center space-x-3.5 ${
            isDark ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FAF8F5] border-[#E8E4DC]'
          }`}>
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#9E9A90]' : 'text-gray-400'}`}>
                Active Live Provider
              </div>
              <div className="text-sm font-bold text-[#C9A050] flex items-center space-x-1.5">
                <span>{activeProviderMeta?.name || config?.ACTIVE_LLM}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informative Banner */}
        <div className={`mt-6 p-4 rounded-xl flex items-start space-x-3 text-xs ${
          isDark ? 'bg-[#1B1B20] text-[#A6A298] border border-[#2D2D35]' : 'bg-[#F9F7F2] text-[#6A665D] border border-[#E8E4DC]'
        }`}>
          <ShieldCheck className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#C9A050]">Zero Downtime Hot-Swap: </span>
            When you switch the provider here, all AstroJunction AI features (Daivajna Counsellor, Daily Transit Predictions, Kundli Milan Synthesis, Numerology Vastu, and 25-Year Roadmap) immediately use the selected engine. Keys not modified will preserve existing values.
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl text-rose-500 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-emerald-500 text-sm flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">AI Engine updated successfully! Live traffic is now routed through {PROVIDERS.find(p => p.id === selectedProvider)?.name}.</span>
        </div>
      )}

      {/* Provider Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold tracking-wide">
            Select Active <span className="text-[#C9A050]">AI Provider</span>
          </h2>
          <span className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
            Click a card to configure its settings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROVIDERS.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const isLive = config?.ACTIVE_LLM === provider.id;
            const Icon = provider.icon;
            const testResult = testResults[provider.id];

            return (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1C1C22] border-[#C9A050] shadow-[0_0_20px_rgba(201,160,80,0.15)] ring-1 ring-[#C9A050]'
                      : 'bg-white border-[#C9A050] shadow-[0_4px_20px_rgba(201,160,80,0.18)] ring-1 ring-[#C9A050]'
                    : isDark
                    ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#3E3E46]'
                    : 'bg-white border-[#E5E1D8] hover:border-[#C9A050]/40'
                }`}
              >
                <div>
                  {/* Top row: Icon & Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-2.5 rounded-xl transition-colors"
                      style={{
                        backgroundColor: `${provider.accentColor}18`,
                        color: provider.accentColor,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {isLive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          LIVE
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                        isDark ? 'bg-white/5 text-[#A6A298]' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {provider.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold tracking-tight">
                    {provider.name}
                  </h3>
                  <div className={`text-xs font-medium mb-2 ${isDark ? 'text-[#C9A050]' : 'text-amber-700'}`}>
                    {provider.tagline}
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    {provider.description}
                  </p>
                </div>

                {/* Bottom Test & Selection indicator */}
                <div className="pt-3 border-t border-dashed border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={testingProvider === provider.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestConnection(provider.id);
                      }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
                        testingProvider === provider.id
                          ? 'opacity-60 cursor-not-allowed'
                          : isDark
                          ? 'border-[#33333C] hover:bg-white/5 text-[#E5E1D8]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {testingProvider === provider.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-[#C9A050]" />
                          <span>Pinging...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3 h-3 text-[#C9A050]" />
                          <span>Test</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {testResult && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            testResult.status === 'ok'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                          title={testResult.message}
                        >
                          {testResult.status === 'ok' ? `${testResult.latency_ms}ms` : 'Error'}
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#C9A050] border-[#C9A050] text-[#0D0D0F]'
                          : isDark ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Provider Details Configuration Form */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8] shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#C9A050]/15 rounded-xl text-[#C9A050]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold">
                Configure <span className="text-[#C9A050]">{PROVIDERS.find(p => p.id === selectedProvider)?.name}</span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                Customize the endpoint address, model parameter, and authentication secrets for this provider.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={testingProvider === selectedProvider}
            onClick={() => handleTestConnection(selectedProvider)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
              testingProvider === selectedProvider
                ? 'opacity-60 cursor-not-allowed'
                : isDark
                ? 'bg-[#1C1C22] border-[#2A2A2E] hover:border-[#C9A050] text-[#E5E1D8]'
                : 'bg-gray-50 border-gray-200 hover:border-[#C9A050] text-gray-800'
            }`}
          >
            {testingProvider === selectedProvider ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C9A050]" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>Test Current Settings</span>
              </>
            )}
          </button>
        </div>

        {/* Live Test Feedback Banner for Current Provider */}
        {testResults[selectedProvider] && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs flex items-start space-x-3 ${
            testResults[selectedProvider].status === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {testResults[selectedProvider].status === 'ok' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold flex items-center space-x-2">
                <span>
                  {testResults[selectedProvider].status === 'ok' ? 'Connection Successful' : 'Connection Failed'}
                </span>
                {testResults[selectedProvider].latency_ms > 0 && (
                  <span className="px-2 py-0.5 bg-black/20 rounded-full text-[10px]">
                    Latency: {testResults[selectedProvider].latency_ms} ms
                  </span>
                )}
              </div>
              <p className="opacity-90">{testResults[selectedProvider].message}</p>
            </div>
          </div>
        )}

        {/* Form Inputs according to selected provider */}
        <div className="space-y-6">
          {/* Provider 1: Mistral Local */}
          {selectedProvider === 'mistral_local' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Local Server Endpoint (URL)
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_LOCAL_URL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_LOCAL_URL', e.target.value)}
                  placeholder="http://122.163.121.176:3041 or http://localhost:11434"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Points to your Ollama or OpenAI-compatible server. Default: <code>http://122.163.121.176:3041</code>
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_MODEL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_MODEL', e.target.value)}
                  placeholder="mistral:latest"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Name of the pulled model in Ollama (e.g. <code>mistral:latest</code>, <code>llama3</code>, etc.)
                </p>
              </div>
            </div>
          )}

          {/* Provider 2: Google Gemini */}
          {selectedProvider === 'gemini' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={formData.GEMINI_API_KEY || ''}
                    onChange={(e) => handleInputChange('GEMINI_API_KEY', e.target.value)}
                    placeholder="AIzaSy..."
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Get your free API Key from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-[#C9A050] underline">Google AI Studio</a>.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Gemini Model
                </label>
                <input
                  type="text"
                  value={formData.GEMINI_MODEL || ''}
                  onChange={(e) => handleInputChange('GEMINI_MODEL', e.target.value)}
                  placeholder="gemini-2.5-flash or gemini-1.5-pro"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Recommended: <code>gemini-2.5-flash</code> for lightning fast responses and low costs.
                </p>
              </div>
            </div>
          )}

          {/* Provider 3: Mistral Cloud */}
          {selectedProvider === 'mistral_cloud' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Mistral Cloud API Key
                </label>
                <div className="relative">
                  <input
                    type={showMistralCloudKey ? 'text' : 'password'}
                    value={formData.MISTRAL_CLOUD_API_KEY || ''}
                    onChange={(e) => handleInputChange('MISTRAL_CLOUD_API_KEY', e.target.value)}
                    placeholder="mis_..."
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMistralCloudKey(!showMistralCloudKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showMistralCloudKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Issued by <a href="https://console.mistral.ai" target="_blank" rel="noreferrer" className="text-[#C9A050] underline">Mistral AI Console</a>.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Cloud Model
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_MODEL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_MODEL', e.target.value)}
                  placeholder="mistral-large-latest"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Available: <code>mistral-large-latest</code>, <code>mistral-small-latest</code>, <code>codestral-latest</code>
                </p>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Mistral Cloud URL
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_CLOUD_URL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_CLOUD_URL', e.target.value)}
                  placeholder="https://api.mistral.ai"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Default: <code>https://api.mistral.ai</code>
                </p>
              </div>
            </div>
          )}

          {/* Provider 4: OpenAI */}
          {selectedProvider === 'openai' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={formData.OPENAI_API_KEY || ''}
                    onChange={(e) => handleInputChange('OPENAI_API_KEY', e.target.value)}
                    placeholder="sk-proj-..."
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  From <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[#C9A050] underline">OpenAI Platform</a>.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  OpenAI Model
                </label>
                <input
                  type="text"
                  value={formData.OPENAI_MODEL || ''}
                  onChange={(e) => handleInputChange('OPENAI_MODEL', e.target.value)}
                  placeholder="gpt-4o-mini"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Default: <code>gpt-4o-mini</code> (cost-efficient and high speed). Also supports <code>gpt-4o</code>.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Custom Base URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.OPENAI_BASE_URL || ''}
                  onChange={(e) => handleInputChange('OPENAI_BASE_URL', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1.5 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Useful for Azure OpenAI Service, OpenRouter, or local proxies.
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-6 border-t border-gray-700/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Provider to activate: <span className="font-bold text-[#C9A050]">{PROVIDERS.find(p => p.id === selectedProvider)?.name}</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchConfig}
                disabled={saving}
                className={`px-5 py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto ${
                  isDark
                    ? 'border-[#2A2A2E] hover:bg-white/5 text-gray-300'
                    : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndActivate}
                disabled={saving}
                className="px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 bg-gradient-to-r from-[#C9A050] to-[#DFB76C] text-[#0D0D0F] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto font-sans"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Apply & Set as Active LLM</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
