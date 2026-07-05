import React from 'react';
import { useFirebase } from './FirebaseProvider';
import { LogOut, Shield, User } from 'lucide-react';

interface NavbarProps {
  currentTab: 'profile' | 'admin';
  onTabChange: (tab: 'profile' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, isAdmin, signOutUser } = useFirebase();

  if (!user) return null;

  return (
    <nav className="h-16 px-4 sm:px-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center font-black text-black text-xs">B</div>
        <span className="font-display font-bold tracking-tighter text-lg sm:text-xl uppercase text-white">
          BGMI <span className="text-amber-500">PRO</span> REGISTRY
        </span>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Admin Toggle */}
        {isAdmin && (
          <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
            <button
              id="nav-profile-tab"
              onClick={() => onTabChange('profile')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentTab === 'profile'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              id="nav-admin-tab"
              onClick={() => onTabChange('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentTab === 'admin'
                  ? 'bg-red-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          </div>
        )}

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "Avatar"}
              className="w-5 h-5 rounded-full border border-zinc-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-bold uppercase">
              {(user.displayName || user.email || 'P')[0]}
            </div>
          )}
          <span className="text-xs font-medium text-zinc-300 max-w-[100px] truncate hidden md:inline">
            {user.displayName || "Gamer"}
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>

        {/* Sign Out Button */}
        <button 
          id="nav-logout-btn"
          onClick={signOutUser}
          className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};
