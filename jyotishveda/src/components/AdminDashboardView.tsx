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
      } catch (err) {
        setError('Network error while loading stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardClasses = `relative overflow-hidden rounded-2xl p-6 transition-all duration-300 shadow-lg ${
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-wide">
            Admin <span className="text-[#C9A050]">Overview</span>
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            Real-time analytics and platform metrics
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#C9A050]/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Total Users
            </h3>
            <div className="p-2 bg-[#C9A050]/20 rounded-lg">
              <Users className="w-5 h-5 text-[#C9A050]" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-bold font-serif">{stats?.total_users || 0}</span>
          </div>
        </div>

        {/* New Users Today */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              New Users Today
            </h3>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-bold font-serif">{stats?.new_users_today || 0}</span>
          </div>
        </div>

        {/* Premium Subscribers */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Premium Subscribers
            </h3>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Star className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-bold font-serif">{stats?.premium_subscribers || 0}</span>
          </div>
        </div>

        {/* Total Blogs */}
        <div className={cardClasses}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              Total Blogs
            </h3>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-bold font-serif">{stats?.total_blogs || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
