import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Star, FileText, Activity } from 'lucide-react';

interface DashboardStats {
  total_users: number;
  new_users_today: number;
  premium_subscribers: number;
  total_blogs: number;
}

interface AdminDashboardViewProps {
  theme: 'dark' | 'light';
  setActiveTab?: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ theme }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/admin/dashboard-stats');
        const data = await response.json();
        
        if (data.status === 'success') {
          setStats(data.data);
        } else {
          setError(data.message || 'Failed to load stats');
        }
      } catch {
        setError('Network error while loading stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardClasses = `relative overflow-hidden rounded-2xl p-7 min-h-[220px] flex flex-col justify-between transition-all duration-300 shadow-md ${
    theme === 'dark'
      ? 'bg-[#141418] border border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50'
      : 'bg-white border border-[#E5E1D8] text-[#0D0D0F] hover:border-[#C9A050]/50'
  }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Activity className="w-8 h-8 text-[#C9A050] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-wide">
            Admin <span className="text-[#C9A050]">Overview</span>
          </h2>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
            Real-time analytics and platform metrics.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs">
          {error}
        </div>
      )}

      {/* 4 Cards in 1 Line with Taller Downward Height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-[#C9A050]/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Total Users
            </h3>
            <div className="p-2.5 bg-[#C9A050]/20 rounded-xl">
              <Users className="w-5 h-5 text-[#C9A050]" />
            </div>
          </div>
          <div className="relative z-10 my-auto pt-4">
            <span className="text-5xl font-bold font-serif tracking-tight">{stats?.total_users || 0}</span>
          </div>
          <div className={`relative z-10 text-[11px] font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-400'}`}>
            Registered user accounts
          </div>
        </div>

        {/* New Users Today */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              New Users Today
            </h3>
            <div className="p-2.5 bg-green-500/20 rounded-xl">
              <UserPlus className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="relative z-10 my-auto pt-4">
            <span className="text-5xl font-bold font-serif tracking-tight text-green-500">{stats?.new_users_today || 0}</span>
          </div>
          <div className={`relative z-10 text-[11px] font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-400'}`}>
            Joined in the last 24 hours
          </div>
        </div>

        {/* Premium Subscribers */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Premium Subscribers
            </h3>
            <div className="p-2.5 bg-purple-500/20 rounded-xl">
              <Star className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="relative z-10 my-auto pt-4">
            <span className="text-5xl font-bold font-serif tracking-tight text-purple-500">{stats?.premium_subscribers || 0}</span>
          </div>
          <div className={`relative z-10 text-[11px] font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-400'}`}>
            Active membership subscriptions
          </div>
        </div>

        {/* Total Blogs */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Total Blogs
            </h3>
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="relative z-10 my-auto pt-4">
            <span className="text-5xl font-bold font-serif tracking-tight text-blue-500">{stats?.total_blogs || 0}</span>
          </div>
          <div className={`relative z-10 text-[11px] font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-400'}`}>
            Published & draft articles
          </div>
        </div>
      </div>
    </div>
  );
};
