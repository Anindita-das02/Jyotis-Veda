import { api } from '../services/api';
import React, { useState, useEffect } from 'react';
import {
  Milestone,
  Sparkles,
  Briefcase,
  DollarSign,
  Heart,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, LifeMilestone, HoroscopeTradition, NumerologyReport } from '../types';

interface LifeRoadmapViewProps {
  profile: UserProfile;
  tradition: HoroscopeTradition;
  chartData: any;
  numerology: NumerologyReport;
  roadmap: LifeMilestone[];
  setRoadmap: React.Dispatch<React.SetStateAction<LifeMilestone[]>>;
}

export const LifeRoadmapView: React.FC<LifeRoadmapViewProps> = ({
  profile,
  tradition,
  chartData,
  numerology,
  roadmap,
  setRoadmap,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('all');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const categories = [
    { id: 'all', label: 'All Life Spheres', icon: Milestone },
    { id: 'Career', label: 'Career & Executive', icon: Briefcase },
    { id: 'Wealth', label: 'Wealth & Real Estate', icon: DollarSign },
    { id: 'Relationships', label: 'Love & Family', icon: Heart },
    { id: 'Health', label: 'Health & Vitality', icon: Activity },
    { id: 'Spirituality', label: 'Spiritual Dharma', icon: Flame },
  ];

  const horizons = ['all', '0-12 Months', '1-3 Years', '3-5 Years', '5-10 Years'];

  const toggleMilestoneCompleted = (id: string) => {
    setRoadmap((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus =
            m.status === 'Completed' ? 'Pending' : m.status === 'In-Progress' ? 'Completed' : 'In-Progress';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleGenerateAiRoadmap = async () => {
    setIsLoadingAi(true);
    try {
      const data = await api.post<any>('/gemini/roadmap', {
        profile,
        tradition,
        chartData,
        numerology,
      });

      if (data && data.milestones && Array.isArray(data.milestones)) {
        setRoadmap(data.milestones);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const filteredRoadmap = roadmap.filter((m) => {
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchHor = selectedHorizon === 'all' || m.timeframe === selectedHorizon;
    return matchCat && matchHor;
  });

  const handleExportRoadmap = () => {
    const text = filteredRoadmap
      .map(
        (m, idx) =>
          `[${idx + 1}] ${m.timeframe} | ${m.title} (${m.category})\nStatus: ${m.status}\nGuidance: ${m.guidance}\nTransit Window: ${m.favorableTransits}\nRemedies: ${m.remedialAction}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vedic_Life_Roadmap_${profile.fullName.replace(/\s+/g, '_')}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Milestone className="w-4 h-4" />
              <span>10-Year Astrological Life Blueprint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              Vedic Destiny Roadmap ({new Date().getFullYear()} – {new Date().getFullYear() + 10})
            </h1>
            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
              Synthesized through your active Vimshottari Mahadasha/Antardasha cycles, major Saturn (Shani) and Jupiter (Guru) transits.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-sans">
            <button
              onClick={handleExportRoadmap}
              className="px-3.5 py-2 rounded-lg bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] transition cursor-pointer text-xs flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Roadmap</span>
            </button>

            <button
              onClick={handleGenerateAiRoadmap}
              disabled={isLoadingAi}
              className="px-4 py-2 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
              <span>{isLoadingAi ? 'Recalculating...' : 'AI Recalculate Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-4 font-sans">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                    : 'bg-[#1A1A1E] text-[#9E9A90] hover:bg-[#2A2A2E] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Horizons */}
        <div className="flex items-center space-x-2 pt-3 text-xs overflow-x-auto font-sans">
          <span className="text-[#9E9A90] text-[11px] shrink-0 font-medium">Time Horizon:</span>
          {horizons.map((hor) => (
            <button
              key={hor}
              onClick={() => setSelectedHorizon(hor)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                selectedHorizon === hor
                  ? 'bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40'
                  : 'bg-[#1A1A1E]/60 text-[#9E9A90] hover:text-[#F0ECE1]'
              }`}
            >
              {hor === 'all' ? 'Full 10 Years' : hor}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Milestone Cards */}
      <div className="space-y-4">
        {filteredRoadmap.map((item, idx) => {
          const isCompleted = item.status === 'Completed';
          const isInProgress = item.status === 'In-Progress';

          return (
            <div
              key={item.id}
              className={`bg-[#141418] border rounded-xl p-5 sm:p-6 text-[#E5E1D8] shadow-xl transition space-y-4 ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isInProgress
                  ? 'border-[#C9A050]/40 bg-[#C9A050]/5'
                  : 'border-[#2A2A2E]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A2E]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-[#C9A050]/30">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1A1A1E] text-[#C9A050] border border-[#2A2A2E]">
                        {item.timeframe}
                      </span>
                      <span className="text-xs font-semibold text-[#9E9A90]">{item.category}</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#F0ECE1] mt-0.5">{item.title}</h3>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => toggleMilestoneCompleted(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isInProgress
                      ? 'bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40'
                      : 'bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E] hover:text-[#F0ECE1]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.status} (Click to toggle)</span>
                </button>
              </div>

              {/* Guidance & Favorable Transits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-[#1A1A1E] p-3.5 rounded-xl border border-[#2A2A2E] space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#C9A050] block tracking-wider">
                    Dasha & Life Strategy Guidance
                  </span>
                  <p className="text-[#E5E1D8] leading-relaxed">{item.guidance}</p>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#1A1A1E] p-3 rounded-xl border border-[#2A2A2E] flex items-center justify-between">
                    <span className="text-[11px] text-[#9E9A90]">Astrological Window:</span>
                    <span className="font-semibold text-[#C9A050] text-right font-mono">{item.favorableTransits}</span>
                  </div>

                  <div className="bg-[#1A1A1E] p-3 rounded-xl border border-[#2A2A2E] flex items-start space-x-2.5">
                    <Flame className="w-3.5 h-3.5 text-[#C9A050] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#9E9A90] block tracking-wider">Recommended Upaya / Sadhana</span>
                      <span className="text-[11px] text-[#E5E1D8]">{item.remedialAction}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
