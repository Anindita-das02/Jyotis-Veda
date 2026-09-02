import React, { useState, useEffect } from 'react';
import { Terminal, Bot, ShieldAlert, AlertTriangle, Info, ShieldX } from 'lucide-react';

interface AILog {
  user_id: string; // Hashed/Anonymous ID
  tradition: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  module: string;
  created_at: string;
}

interface AdminLogsViewProps {
  theme: 'dark' | 'light';
}

export const AdminLogsView: React.FC<AdminLogsViewProps> = ({ theme }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'system'>('ai');
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'ai') {
        const response = await fetch('http://localhost:5001/api/admin/logs/ai');
        const data = await response.json();
        if (data.status === 'success') setAiLogs(data.data);
      } else {
        const response = await fetch('http://localhost:5001/api/admin/logs/system');
        const data = await response.json();
        if (data.status === 'success') setSystemLogs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeSubTab]);

  const bgClass = theme === 'dark' ? 'bg-[#141418]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]';
  const textClass = theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]';
  const textMutedClass = theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500';

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#C9A050]" />
            System &amp; AI <span className="text-[#C9A050]">Logs</span>
          </h2>
          <p className={`mt-0.5 text-xs ${textMutedClass}`}>
            Audit trail of AI oracle interactions and backend system errors.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${borderClass} gap-4 text-xs`}>
        <button
          onClick={() => setActiveSubTab('ai')}
          className={`pb-2.5 px-1 font-medium transition-colors ${activeSubTab === 'ai' ? 'text-[#C9A050] border-b-2 border-[#C9A050] font-bold' : textMutedClass}`}
        >
          <div className="flex items-center gap-1.5">
            <Bot className="w-4 h-4" /> AI Oracle Consultations
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('system')}
          className={`pb-2.5 px-1 font-medium transition-colors ${activeSubTab === 'system' ? 'text-red-500 border-b-2 border-red-500 font-bold' : textMutedClass}`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> System Errors
          </div>
        </button>
      </div>

      <div className={`rounded-xl border ${borderClass} overflow-hidden shadow-sm ${bgClass}`}>
        {loading ? (
          <div className="p-10 flex justify-center">
            <Terminal className="w-6 h-6 text-[#C9A050] animate-pulse" />
          </div>
        ) : activeSubTab === 'ai' ? (
          <div className="divide-y divide-[#2A2A2E]/30 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[160px] custom-scrollbar">
            {aiLogs.length === 0 ? (
              <div className={`p-8 text-center text-xs ${textMutedClass}`}>No AI logs found.</div>
            ) : (
              aiLogs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${log.role === 'assistant' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {log.role}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">ID: {log.user_id.substring(0, 8)}...</span>
                      <span className="text-[11px] text-gray-500">{log.tradition}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className={`text-xs ${textClass} whitespace-pre-wrap font-mono`}>{log.content}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[160px] custom-scrollbar">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="sticky top-0 z-10">
                <tr className={`border-b ${borderClass} ${theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#FAF8F2]'}`}>
                  <th className={`p-3 font-semibold ${textMutedClass}`}>Level</th>
                  <th className={`p-3 font-semibold ${textMutedClass}`}>Module</th>
                  <th className={`p-3 font-semibold ${textMutedClass}`}>Message</th>
                  <th className={`p-3 font-semibold ${textMutedClass}`}>Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]/30">
                {systemLogs.length === 0 ? (
                  <tr><td colSpan={4} className={`p-8 text-center text-xs ${textMutedClass}`}>No system errors logged.</td></tr>
                ) : (
                  systemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        {log.level === 'error' && <span className="text-red-500 flex items-center gap-1"><ShieldX className="w-3.5 h-3.5"/> ERR</span>}
                        {log.level === 'warning' && <span className="text-orange-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> WARN</span>}
                        {log.level === 'info' && <span className="text-blue-500 flex items-center gap-1"><Info className="w-3.5 h-3.5"/> INFO</span>}
                      </td>
                      <td className={`p-3 ${textClass}`}>{log.module}</td>
                      <td className={`p-3 text-[11px] ${textMutedClass} max-w-xl truncate`} title={log.message}>
                        {log.message.substring(0, 100)}...
                      </td>
                      <td className={`p-3 text-[11px] ${textMutedClass}`}>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
