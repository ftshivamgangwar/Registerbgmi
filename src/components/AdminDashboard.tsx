import React, { useEffect, useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, OperationType } from '../types';
import { motion } from 'motion/react';
import { 
  Search, 
  Gamepad2, 
  Download, 
  ExternalLink, 
  Phone, 
  Users, 
  RefreshCw,
  TrendingUp,
  Instagram,
  Edit,
  ShieldAlert,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { EditUserModal } from './EditUserModal';

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit and Block feature states
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    const path = 'users';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserProfile);
      });
      // Sort users by registration date desc
      fetchedUsers.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return dateB - dateA;
      });
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please verify admin privileges.");
      handleFirestoreError(err, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBlockStatus = async (userToUpdate: UserProfile) => {
    setActionLoadingId(userToUpdate.uid);
    setError(null);
    const isBlocking = !userToUpdate.blocked;
    const docPath = `users/${userToUpdate.uid}`;
    
    try {
      const docRef = doc(db, 'users', userToUpdate.uid);
      await updateDoc(docRef, { blocked: isBlocking });
      
      // Update local state
      setUsers(prev => prev.map(u => u.uid === userToUpdate.uid ? { ...u, blocked: isBlocking } : u));
    } catch (err: any) {
      console.error("Error toggling block status:", err);
      setError(`Failed to ${isBlocking ? 'block' : 'unblock'} player. Please try again.`);
      handleFirestoreError(err, OperationType.WRITE, docPath);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-center">
        <h3 className="font-display font-bold text-lg">ACCESS DENIED</h3>
        <p className="text-xs mt-2">Only the authorized admin can view this dashboard.</p>
      </div>
    );
  }

  // Filter users by BGMI ID or BGMI Name
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      user.bgmiId.toLowerCase().includes(q) ||
      user.bgmiName.toLowerCase().includes(q) ||
      user.realName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const getFormattedDate = (createdAt: any) => {
    if (!createdAt) return 'N/A';
    const date = createdAt.seconds 
      ? new Date(createdAt.seconds * 1000) 
      : new Date(createdAt);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  // Export to CSV helper
  const exportToCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ['Real Name', 'Email', 'BGMI ID', 'BGMI Name', 'UPI ID', 'Instagram ID', 'WhatsApp Number', 'Registration Date', 'Status'];
    const rows = filteredUsers.map(user => [
      `"${user.realName.replace(/"/g, '""')}"`,
      `"${user.email.replace(/"/g, '""')}"`,
      `"${user.bgmiId}"`,
      `"${user.bgmiName.replace(/"/g, '""')}"`,
      `"${user.upiId}"`,
      `"${user.instagramId}"`,
      `"${user.whatsappNumber}"`,
      `"${getFormattedDate(user.createdAt)}"`,
      `"${user.blocked ? 'Suspended' : 'Active'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bgmi_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight italic text-white">
            Admin <span className="text-amber-500 underline decoration-4 underline-offset-4">Dashboard</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time management portal for registered players, esports brackets, and billing verification.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            id="admin-refresh-btn"
            onClick={fetchAllUsers}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          
          <button
            id="admin-export-btn"
            onClick={exportToCSV}
            disabled={filteredUsers.length === 0}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase rounded-lg tracking-widest text-xs transition-all active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Total Teams/Players</span>
            <span className="text-2xl font-bold text-white mt-1 block">{users.length}</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Active Search Hits</span>
            <span className="text-2xl font-bold text-white mt-1 block">{filteredUsers.length}</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Last Registration</span>
            <span className="text-sm font-mono font-bold text-amber-500 mt-2 block truncate">
              {users.length > 0 ? getFormattedDate(users[0].createdAt) : 'None'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="admin-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by BGMI ID, Game Name, Real Name, or Email..."
          className="block w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
            <p className="text-sm">Loading player records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Gamepad2 className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
            <p className="text-sm">No player registrations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase text-[10px] font-mono tracking-wider">
                  <th className="py-4 px-6">BGMI IGN / ID</th>
                  <th className="py-4 px-6">Real Name / Email</th>
                  <th className="py-4 px-6">UPI ID</th>
                  <th className="py-4 px-6">Social Contacts</th>
                  <th className="py-4 px-6">Reg Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.uid}
                    className={`hover:bg-zinc-950/40 transition-colors text-sm text-zinc-300 ${user.blocked ? 'bg-red-950/10' : ''}`}
                  >
                    {/* IGN / ID */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white tracking-tight">
                          {user.bgmiName}
                        </span>
                        <span className="text-xs text-amber-500 font-mono mt-0.5">
                          ID: {user.bgmiId}
                        </span>
                      </div>
                    </td>

                    {/* Name / Email */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-200">{user.realName}</span>
                        <span className="text-xs text-zinc-500 font-mono mt-0.5">{user.email}</span>
                      </div>
                    </td>

                    {/* UPI ID */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-zinc-300">
                        {user.upiId}
                      </span>
                    </td>

                    {/* Social / WhatsApp */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        <a 
                          href={`https://wa.me/91${user.whatsappNumber}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-green-400 hover:underline flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3 text-green-500" />
                          <span>{user.whatsappNumber}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                        <a 
                          href={`https://instagram.com/${user.instagramId}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-pink-400 hover:underline flex items-center space-x-1"
                        >
                          <Instagram className="w-3 h-3 text-pink-500" />
                          <span>@{user.instagramId}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-zinc-500 font-mono">
                      {getFormattedDate(user.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {user.blocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider font-mono">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider font-mono">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(user);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-amber-500 transition-all cursor-pointer inline-flex items-center justify-center active:scale-95"
                          title="Edit Player Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Block / Unblock Button */}
                        <button
                          onClick={() => toggleUserBlockStatus(user)}
                          disabled={actionLoadingId === user.uid}
                          className={`p-2 border rounded-lg transition-all cursor-pointer inline-flex items-center justify-center active:scale-95 ${
                            user.blocked
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                          }`}
                          title={user.blocked ? "Unblock Player" : "Block/Suspend Player"}
                        >
                          {actionLoadingId === user.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.blocked ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <EditUserModal
          user={selectedUserForEdit}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUserForEdit(null);
          }}
          onSuccess={() => {
            fetchAllUsers();
          }}
        />
      )}

    </div>
  );
};
