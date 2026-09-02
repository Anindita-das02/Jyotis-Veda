import React, { useState, useEffect } from 'react';
import { IndianRupee, Wallet, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  total_successful: number;
  total_failed: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  created_at: string;
  full_name: string;
  email: string;
}

interface AdminRevenueViewProps {
  theme: 'dark' | 'light';
}

export const AdminRevenueView: React.FC<AdminRevenueViewProps> = ({ theme }) => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'monthly' | 'successful' | 'failed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, txnsRes] = await Promise.all([
          fetch('http://localhost:5001/api/admin/revenue/stats'),
          fetch('http://localhost:5001/api/admin/revenue/transactions')
        ]);
        
        const statsData = await statsRes.json();
        const txnsData = await txnsRes.json();
        
        if (statsData.status === 'success') setStats(statsData.data);
        if (txnsData.status === 'success') setTransactions(txnsData.data);
      } catch (err) {
        setError('Failed to load revenue data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const bgClass = theme === 'dark' ? 'bg-[#141418]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]';
  const textClass = theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]';
  const textMutedClass = theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Wallet className="w-8 h-8 text-[#C9A050] animate-pulse" />
      </div>
    );
  }

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    if (filter === 'successful') return txn.status === 'success';
    if (filter === 'failed') return txn.status === 'failed';
    if (filter === 'monthly') {
      const date = new Date(txn.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-3 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#C9A050]" />
            Revenue <span className="text-[#C9A050]">Dashboard</span>
          </h2>
          <p className={`mt-0.5 text-xs ${textMutedClass}`}>
            Track platform income and monitor payment health.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-3 rounded-xl border ${borderClass} shadow-xs ${theme === 'dark' ? 'bg-gradient-to-br from-[#141418] to-[#1A1A20]' : 'bg-gradient-to-br from-white to-gray-50'}`}>
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-600 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> All Time
            </span>
          </div>
          <h3 className={`text-[11px] font-semibold ${textMutedClass} uppercase tracking-wider mb-0.5`}>Total Revenue</h3>
          <p className={`text-xl font-bold ${textClass}`}>{formatCurrency(stats?.total_revenue)}</p>
        </div>

        <div className={`p-3 rounded-xl border ${borderClass} shadow-xs ${theme === 'dark' ? 'bg-gradient-to-br from-[#141418] to-[#1A1A20]' : 'bg-gradient-to-br from-white to-gray-50'}`}>
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Activity className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 flex items-center gap-1">
              This Month
            </span>
          </div>
          <h3 className={`text-[11px] font-semibold ${textMutedClass} uppercase tracking-wider mb-0.5`}>Monthly Revenue</h3>
          <p className={`text-xl font-bold ${textClass}`}>{formatCurrency(stats?.monthly_revenue)}</p>
        </div>

        <div className={`p-3 rounded-xl border ${borderClass} shadow-xs ${theme === 'dark' ? 'bg-gradient-to-br from-[#141418] to-[#1A1A20]' : 'bg-gradient-to-br from-white to-gray-50'}`}>
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-[11px] font-semibold ${textMutedClass} uppercase tracking-wider mb-0.5`}>Successful Payments</h3>
          <p className={`text-xl font-bold ${textClass}`}>{stats?.total_successful || 0}</p>
        </div>

        <div className={`p-3 rounded-xl border ${borderClass} shadow-xs ${theme === 'dark' ? 'bg-gradient-to-br from-[#141418] to-[#1A1A20]' : 'bg-gradient-to-br from-white to-gray-50'}`}>
          <div className="flex justify-between items-start mb-1.5">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-[11px] font-semibold ${textMutedClass} uppercase tracking-wider mb-0.5`}>Failed Payments</h3>
          <p className="text-xl font-bold text-red-500">{stats?.total_failed || 0}</p>
        </div>
      </div>

      {/* Transactions Table with Internal Vertical Scrolling */}
      <div className={`rounded-xl border ${borderClass} overflow-hidden shadow-sm ${bgClass}`}>
        <div className={`p-2.5 px-3.5 border-b ${borderClass} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2`}>
          <h3 className={`text-sm font-bold font-serif ${textClass}`}>Recent Transactions</h3>
          <div className="flex flex-wrap bg-black/5 dark:bg-white/5 rounded-lg p-0.5 gap-1">
            {(['all', 'monthly', 'successful', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                  filter === f
                    ? 'bg-[#C9A050] text-black shadow-xs font-bold'
                    : `hover:bg-black/5 dark:hover:bg-white/10 ${textMutedClass}`
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Table Body */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] min-h-[120px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 border-b ${borderClass} ${theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#F9F7F1]'}`}>
              <tr>
                <th className={`p-2.5 px-3.5 text-[11px] font-bold uppercase tracking-wider ${textMutedClass}`}>Date</th>
                <th className={`p-2.5 px-3.5 text-[11px] font-bold uppercase tracking-wider ${textMutedClass}`}>User</th>
                <th className={`p-2.5 px-3.5 text-[11px] font-bold uppercase tracking-wider ${textMutedClass}`}>Method</th>
                <th className={`p-2.5 px-3.5 text-[11px] font-bold uppercase tracking-wider ${textMutedClass} text-right`}>Amount</th>
                <th className={`p-2.5 px-3.5 text-[11px] font-bold uppercase tracking-wider ${textMutedClass} text-right`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2E]/30">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`p-8 text-center text-xs font-medium ${textMutedClass}`}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className={`transition-colors hover:bg-black/5 ${theme === 'dark' ? 'hover:bg-white/5' : ''}`}>
                    <td className={`p-2.5 px-3.5 text-[11px] ${textMutedClass}`}>
                      {new Date(txn.created_at).toLocaleString()}
                    </td>
                    <td className="p-2.5 px-3.5">
                      <div className={`font-semibold text-xs ${textClass}`}>{txn.full_name}</div>
                      <div className={`text-[10px] ${textMutedClass}`}>{txn.email}</div>
                    </td>
                    <td className="p-2.5 px-3.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-400/20">
                        {txn.payment_method}
                      </span>
                    </td>
                    <td className={`p-2.5 px-3.5 text-right font-bold text-xs ${textClass}`}>
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="p-2.5 px-3.5 text-right">
                      {txn.status === 'success' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-600 border border-green-500/30">
                          Success
                        </span>
                      )}
                      {txn.status === 'failed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-600 border border-red-500/30">
                          Failed
                        </span>
                      )}
                      {txn.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
