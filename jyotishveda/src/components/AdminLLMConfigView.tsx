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
  Check,
  ExternalLink,
  Activity,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { adminApi, LLMConfig } from '../services/adminApi';

interface AdminLLMConfigViewProps {
  theme: 'dark' | 'light';
}

export type LLMProvider = 'mistral_local' | 'gemini' | 'mistral_cloud' | 'openai';

interface ProviderMeta {
  id: LLMProvider;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  accentColor: string;
  docsUrl: string;
  docsName: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'mistral_local',
    name: 'Mistral Local',
    tagline: 'Self-Hosted / Ollama',
    description: 'On-premises server running open-weights Mistral. Full data privacy and zero cloud API fees.',
    icon: Server,
    badge: 'Self-Hosted',
    accentColor: '#3B82F6',
    docsUrl: 'https://ollama.com/library',
    docsName: 'Ollama Models',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Gemini 2.5 Flash / Pro',
    description: 'Fast multimodal model with high rate limits, low latency, and excellent accuracy.',
    icon: Sparkles,
    badge: 'Recommended',
    accentColor: '#10B981',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsName: 'Get Gemini Key',
  },
  {
    id: 'mistral_cloud',
    name: 'Mistral Cloud',
    tagline: 'Official Mistral API',
    description: 'Cloud-hosted Mistral Large/Small models directly from Mistral AI with high synthesis accuracy.',
    icon: Cloud,
    badge: 'Cloud API',
    accentColor: '#F59E0B',
    docsUrl: 'https://console.mistral.ai',
    docsName: 'Get Mistral Key',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    tagline: 'GPT-4o / GPT-4o-mini',
    description: 'Industry-standard reasoning models supporting standard endpoints and custom proxies.',
    icon: Zap,
    badge: 'Cloud API',
    accentColor: '#8B5CF6',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsName: 'Get OpenAI Key',
  },
];

export const AdminLLMConfigView: React.FC<AdminLLMConfigViewProps> = ({ theme }) => {
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('mistral_local');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Key verification state
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'ok' | 'error';
    message: string;
    latency_ms?: number;
  } | null>(null);

  // Password visibility
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showMistralCloudKey, setShowMistralCloudKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<LLMConfig>>({});

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setErrorMessage(null);
    setTestResult(null);
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

  const handleInputChange = (field: keyof LLMConfig, value: any) => {
    setTestResult(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Live test to check if the entered API Key / URL is right or wrong
  const handleVerifyKey = async () => {
    const pName = PROVIDERS.find((p) => p.id === selectedProvider)?.name || selectedProvider;
    if (!isProviderConfigured(selectedProvider)) {
      setTestResult({
        status: 'error',
        message: `Please enter the ${selectedProvider === 'mistral_local' ? 'Server URL' : 'API Key'} before verifying.`,
      });
      return;
    }

    setTestingKey(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const res: any = await adminApi.testLLMConnection(selectedProvider, formData);
      if (res?.status === 'ok' || res?.success) {
        setTestResult({
          status: 'ok',
          message: res.message || `${pName} credentials are valid and connection is live!`,
          latency_ms: res.latency_ms,
        });
      } else {
        setTestResult({
          status: 'error',
          message: res?.message || `Invalid ${pName} credentials: Authentication rejected.`,
          latency_ms: res?.latency_ms,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err?.message || `Verification check failed. Could not reach ${pName}.`,
      });
    } finally {
      setTestingKey(false);
    }
  };

  // Save settings without changing active engine
  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      const res: any = await adminApi.updateLLMConfig(formData);
      const updated = res?.settings || res?.data || res;
      if (updated && typeof updated === 'object') {
        setConfig(updated);
        setFormData(updated);
      }
      setSaveSuccess('Configuration saved to MySQL database successfully.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const isProviderConfigured = (providerId: LLMProvider): boolean => {
    switch (providerId) {
      case 'gemini':
        return Boolean(formData.GEMINI_API_KEY?.trim() || config?.gemini?.is_configured || config?.is_configured?.gemini);
      case 'openai':
        return Boolean(formData.OPENAI_API_KEY?.trim() || config?.openai?.is_configured || config?.is_configured?.openai);
      case 'mistral_cloud':
        return Boolean(formData.MISTRAL_CLOUD_API_KEY?.trim() || config?.mistral_cloud?.is_configured || config?.is_configured?.mistral_cloud);
      case 'mistral_local':
        return Boolean(formData.MISTRAL_LOCAL_URL?.trim() || config?.mistral_local?.url?.trim() || config?.is_configured?.mistral_local);
      default:
        return false;
    }
  };

  // Set selected provider as the live active engine
  const handleSetActive = async (provider: LLMProvider) => {
    const pName = PROVIDERS.find((p) => p.id === provider)?.name || provider;
    if (!isProviderConfigured(provider)) {
      setErrorMessage(
        `Cannot activate ${pName}: Please enter the required ${
          provider === 'mistral_local' ? 'Server URL' : 'API Key'
        } first.`
      );
      return;
    }

    setSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      const payload: Partial<LLMConfig> = {
        ...formData,
        ACTIVE_LLM: provider,
      };

      const res: any = await adminApi.updateLLMConfig(payload);
      const updated = res?.settings || res?.data || res;
      if (updated && typeof updated === 'object') {
        setConfig(updated);
        setFormData(updated);
      }
      setSaveSuccess(`${pName} is now active and saved to MySQL database.`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to activate engine');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Activity className="w-8 h-8 text-[#C9A050] animate-spin" />
        <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
          Loading AI engine settings...
        </p>
      </div>
    );
  }

  const activeProvider = PROVIDERS.find((p) => p.id === (config?.ACTIVE_LLM || 'mistral_local'))!;
  const currentProvider = PROVIDERS.find((p) => p.id === selectedProvider)!;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Clean Top Header */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
        isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#C9A050]/15 rounded-xl border border-[#C9A050]/30 text-[#C9A050]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">
                AI Engine <span className="text-[#C9A050]">Settings</span>
              </h1>
              <p className={`text-xs font-sans mt-0.5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                Configure and select the LLM powering all predictions and Vedic counsel.
              </p>
            </div>
          </div>

          {/* Current Active Badge */}
          <div className={`px-4 py-2.5 rounded-xl border flex items-center space-x-2.5 self-start sm:self-auto ${
            isDark ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FAF8F5] border-[#E8E4DC]'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#9E9A90]' : 'text-gray-400'}`}>
                Active Engine
              </div>
              <div className="text-xs font-bold text-[#C9A050]">
                {activeProvider.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{saveSuccess}</span>
        </div>
      )}

      {/* Provider Selection Cards (Clean, sober, no ping clutter) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#C9A050] mb-3">
          Select Engine to Configure
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PROVIDERS.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const isLive = config?.ACTIVE_LLM === provider.id;
            const Icon = provider.icon;

            return (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1C1C22] border-[#C9A050] shadow-md ring-1 ring-[#C9A050]'
                      : 'bg-white border-[#C9A050] shadow-md ring-1 ring-[#C9A050]'
                    : isDark
                    ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#3E3E46]'
                    : 'bg-white border-[#E5E1D8] hover:border-[#C9A050]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: `${provider.accentColor}18`,
                        color: provider.accentColor,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center space-x-1">
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Active
                        </span>
                      ) : isProviderConfigured(provider.id) ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {provider.id === 'mistral_local' ? 'URL Missing' : 'Key Missing'}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {provider.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold tracking-tight">
                    {provider.name}
                  </h3>
                  <div className={`text-[11px] font-medium mb-1.5 ${isDark ? 'text-[#C9A050]' : 'text-amber-800'}`}>
                    {provider.tagline}
                  </div>
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    {provider.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-700/20 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-[#C9A050] font-semibold' : 'text-gray-500'}>
                    {isSelected ? 'Editing Settings' : 'Click to Edit'}
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'bg-[#C9A050] border-[#C9A050] text-[#0D0D0F]'
                      : isDark ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Form for Selected Provider */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
        isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-gray-700/20 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-serif font-bold">
                Configure <span className="text-[#C9A050]">{currentProvider.name}</span>
              </h2>
              {config?.ACTIVE_LLM === currentProvider.id ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Active in Production
                </span>
              ) : !isProviderConfigured(currentProvider.id) ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentProvider.id === 'mistral_local' ? 'URL Required' : 'API Key Required'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Configured & Ready
                </span>
              )}
            </div>
            <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Enter the endpoint and authentication credentials below.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            {/* Live Key Verification Test Button */}
            <button
              type="button"
              disabled={testingKey || !isProviderConfigured(currentProvider.id)}
              onClick={handleVerifyKey}
              title={
                !isProviderConfigured(currentProvider.id)
                  ? 'Please enter credentials before verifying'
                  : 'Test if this API key is genuine and active with the provider'
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all ${
                testingKey
                  ? 'opacity-80 cursor-wait bg-[#C9A050]/15 text-[#C9A050] border-[#C9A050]/40'
                  : !isProviderConfigured(currentProvider.id)
                  ? 'opacity-40 cursor-not-allowed border-gray-700 text-gray-500'
                  : isDark
                  ? 'bg-[#1C1C22] border-[#C9A050]/50 text-[#C9A050] hover:bg-[#C9A050]/15'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {testingKey ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify {currentProvider.id === 'mistral_local' ? 'URL' : 'API Key'}</span>
                </>
              )}
            </button>

            <a
              href={currentProvider.docsUrl}
              target="_blank"
              rel="noreferrer"
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors inline-flex items-center space-x-1.5 ${
                isDark ? 'border-[#2A2A2E] text-[#9E9A90] hover:text-white' : 'border-gray-200 text-gray-600 hover:text-black'
              }`}
            >
              <span>{currentProvider.docsName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Live Verification Result Banner */}
        {testResult && (
          <div
            className={`mb-4 p-3.5 rounded-xl text-xs border flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              testResult.status === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {testResult.status === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>
                <strong>{testResult.status === 'ok' ? 'Key Verified Valid:' : 'Key Invalid / Rejected:'}</strong>{' '}
                {testResult.message}
              </span>
            </div>
            {testResult.latency_ms !== undefined && testResult.latency_ms > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                {testResult.latency_ms}ms
              </span>
            )}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          {/* Mistral Local */}
          {selectedProvider === 'mistral_local' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Server Endpoint URL
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_LOCAL_URL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_LOCAL_URL', e.target.value)}
                  placeholder="http://localhost:11434 or http://<server-ip>:<port>"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1 text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Root URL of your Ollama or OpenAI-compatible local server.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_MODEL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_MODEL', e.target.value)}
                  placeholder="mistral:latest"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1 text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  e.g. <code>mistral:latest</code>, <code>llama3:latest</code>, etc.
                </p>
              </div>
            </div>
          )}

          {/* Gemini */}
          {selectedProvider === 'gemini' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
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
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Encrypted in database. Masked for security.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.GEMINI_MODEL || ''}
                  onChange={(e) => handleInputChange('GEMINI_MODEL', e.target.value)}
                  placeholder="gemini-2.5-flash"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
                <p className={`mt-1 text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  Recommended: <code>gemini-2.5-flash</code> or <code>gemini-1.5-pro</code>.
                </p>
              </div>
            </div>
          )}

          {/* Mistral Cloud */}
          {selectedProvider === 'mistral_cloud' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
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
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMistralCloudKey(!showMistralCloudKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showMistralCloudKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Cloud Model
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_MODEL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_MODEL', e.target.value)}
                  placeholder="mistral-large-latest"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Mistral Base URL
                </label>
                <input
                  type="text"
                  value={formData.MISTRAL_CLOUD_URL || ''}
                  onChange={(e) => handleInputChange('MISTRAL_CLOUD_URL', e.target.value)}
                  placeholder="https://api.mistral.ai"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
              </div>
            </div>
          )}

          {/* OpenAI */}
          {selectedProvider === 'openai' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
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
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-mono transition-colors ${
                      isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showOpenAIKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  OpenAI Model
                </label>
                <input
                  type="text"
                  value={formData.OPENAI_MODEL || ''}
                  onChange={(e) => handleInputChange('OPENAI_MODEL', e.target.value)}
                  placeholder="gpt-4o-mini"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Custom Base URL (Optional for Proxies / Azure)
                </label>
                <input
                  type="text"
                  value={formData.OPENAI_BASE_URL || ''}
                  onChange={(e) => handleInputChange('OPENAI_BASE_URL', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Global LLM Execution Setting: Request Timeout */}
        <div className="mt-6 pt-5 border-t border-gray-700/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#C9A050]" />
                <label className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#C9A050]' : 'text-amber-800'
                }`}>
                  Request Timeout (Seconds)
                </label>
              </div>
              <p className={`mt-0.5 text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                Maximum duration to wait for AI response before timing out (saved in MySQL).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {[15, 30, 60, 120].map((sec) => {
                const isSelected = Number(formData.LLM_TIMEOUT || 30) === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleInputChange('LLM_TIMEOUT', sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-sm'
                        : isDark
                        ? 'bg-[#1C1C22] border-[#2A2A2E] text-gray-300 hover:border-gray-600'
                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {sec}s
                  </button>
                );
              })}
              <div className="flex items-center space-x-1 pl-1">
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.LLM_TIMEOUT ?? 30}
                  onChange={(e) => handleInputChange('LLM_TIMEOUT', e.target.value)}
                  className={`w-16 px-2.5 py-1.5 rounded-lg border text-xs font-mono text-center transition-colors ${
                    isDark
                      ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050] focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050] focus:outline-none'
                  }`}
                  placeholder="30"
                />
                <span className={`text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  sec
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Clean and Sober) */}
        <div className="mt-6 pt-5 border-t border-gray-700/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-[11px] text-gray-500">
            {saving ? (
              <span className="text-[#C9A050] flex items-center space-x-1.5 animate-pulse font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to MySQL database...</span>
              </span>
            ) : (
              <span>Changes take effect immediately upon saving.</span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Save Config */}
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1.5 w-full sm:w-auto ${
                isDark
                  ? 'bg-[#1C1C22] border-[#2A2A2E] hover:border-[#C9A050] text-[#E5E1D8]'
                  : 'bg-gray-50 border-gray-200 hover:border-[#C9A050] text-gray-800'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C9A050]" />
                  <span>Save Settings</span>
                </>
              )}
            </button>

            {/* Set as Active */}
            {config?.ACTIVE_LLM === currentProvider.id ? (
              <div className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center space-x-1.5 w-full sm:w-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Live Engine</span>
              </div>
            ) : !isProviderConfigured(currentProvider.id) ? (
              <button
                type="button"
                disabled
                title={
                  currentProvider.id === 'mistral_local'
                    ? 'Please configure Endpoint URL and save before activating'
                    : 'Please enter API Key and save before activating'
                }
                className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400/80 cursor-not-allowed opacity-75 w-full sm:w-auto font-sans"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {currentProvider.id === 'mistral_local' ? 'URL Required to Activate' : 'API Key Required to Activate'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSetActive(currentProvider.id)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-1.5 bg-gradient-to-r from-[#C9A050] to-[#DFB76C] text-[#0D0D0F] hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer w-full sm:w-auto font-sans"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Set as Active LLM</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
