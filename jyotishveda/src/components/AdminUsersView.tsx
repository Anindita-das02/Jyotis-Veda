import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, User, AlertCircle, Ban, CheckCircle } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
}

interface AdminUsersViewProps {
  theme: 'dark' | 'light';
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ theme }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/users');
      const data = await response.json();
      
      if (data.status === 'success') {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      setError('Network error while loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Failed to change role');
      }
    } catch (error) {
      alert('Error updating role');
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionText = newStatus === 0 ? 'SUSPEND' : 'ACTIVATE';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        alert(`Failed to ${actionText.toLowerCase()} user`);
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently DELETE this user? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Users className="w-8 h-8 text-[#C9A050] animate-spin" />
      </div>
    );
  }

  const bgClass = theme === 'dark' ? 'bg-[#141418]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]';
  const textClass = theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]';
  const textMutedClass = theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500';

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C9A050]" />
            User <span className="text-[#C9A050]">Management</span>
          </h2>
          <p className={`mt-0.5 text-xs ${textMutedClass}`}>
            Manage registered accounts, roles, access permissions, and account status.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className={`rounded-xl border ${borderClass} overflow-hidden shadow-sm ${bgClass}`}>
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[220px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b ${borderClass} ${theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#FAF8F2]'}`}>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${textMutedClass}`}>Name</th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${textMutedClass}`}>Email</th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${textMutedClass}`}>Joined</th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${textMutedClass}`}>Role</th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${textMutedClass}`}>Status</th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${textMutedClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2E]/30">
              {users.map((user) => (
                <tr key={user.id} className={`transition-colors hover:bg-black/5 ${theme === 'dark' ? 'hover:bg-white/5' : ''}`}>
                  <td className={`px-4 py-3 font-medium text-xs ${textClass}`}>
                    {user.full_name}
                  </td>
                  <td className={`px-4 py-3 text-xs ${textMutedClass}`}>
                    {user.email}
                  </td>
                  <td className={`px-4 py-3 text-xs ${textMutedClass}`}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium outline-none cursor-pointer border
                        ${user.role === 'admin' 
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${user.is_active === 1 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {user.is_active === 1 ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {user.is_active === 1 ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleStatusChange(user.id, user.is_active)}
                      className={`p-1.5 rounded-lg transition-colors border
                        ${user.is_active === 1 
                          ? 'text-orange-500 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20' 
                          : 'text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20'}`}
                      title={user.is_active === 1 ? "Suspend User" : "Activate User"}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-lg text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      title="Delete User permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <Users className="w-8 h-8 text-[#9E9A90]/40" />
                      <p className={`text-xs font-medium ${textMutedClass}`}>No users found in the system.</p>
                      <p className={`text-[11px] ${theme === 'dark' ? 'text-[#9E9A90]/60' : 'text-gray-400'}`}>Registered users will appear here automatically.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
