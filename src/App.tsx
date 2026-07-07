import React, { useState } from 'react';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { BlockedView } from './components/BlockedView';
import { Trophy, LogIn, Loader2, Gamepad2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainAppContent: React.FC = () => {
  const { user, profile, loading, profileLoading, signInWithGoogle, isAdmin } = useFirebase();
  const [currentTab, setCurrentTab] = useState<'profile' | 'admin'>('profile');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login Error:", err);
      setAuthError(err.message || "Failed to sign in with Google. Please try again.");
    }
  };

  // 1. Initial Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <Trophy className="w-12 h-12 text-amber-500 animate-bounce mb-4" />
        <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Loading registry protocol...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center flex flex-col gap-5">
            
            {/* Top Logo box */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-amber-500 rounded-sm flex items-center justify-center font-black text-black text-lg">
                B
              </div>
            </div>

            {/* Typography */}
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">
                BGMI <span className="text-amber-500">PRO</span> REGISTRY
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                Official Registration Portal
              </p>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Complete your verification for tournament eligibility. Sign in with your Google account to sync your credentials and lock your gaming identity.
            </p>

            {/* Auth errors */}
            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-start space-x-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login CTA */}
            <button
              id="google-signin-btn"
              onClick={handleLogin}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase py-3.5 px-5 rounded-lg tracking-widest text-xs transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex items-center justify-center space-x-3 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-black" />
              <span>Sign In with Google</span>
            </button>

            {/* Footer */}
            <div className="mt-4 pt-6 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono flex items-center justify-center gap-2">
              <Gamepad2 className="w-3.5 h-3.5 text-zinc-700" />
              <span>Powered by Firebase & Google Cloud</span>
            </div>

          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated Content
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-100 justify-between">
      <div className="flex flex-col w-full">
        <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="w-full py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* Profile Loading State */}
            {profileLoading ? (
              <motion.div
                key="profile-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Verifying registry status...</p>
              </motion.div>
            ) : !profile ? (
              /* If profile is incomplete, force them to complete registration first */
              <RegistrationForm key="registration-form" />
            ) : profile.blocked && !isAdmin ? (
              /* Display Blocked View if account is suspended */
              <BlockedView key="blocked-view" />
            ) : currentTab === 'admin' && isAdmin ? (
              /* Admin Dashboard */
              <AdminDashboard key="admin-dashboard" />
            ) : (
              /* Standard Profile View */
              <ProfileView key="profile-view" />
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Clean Minimalism bottom footer */}
      <footer className="h-10 px-4 sm:px-8 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-600 mt-auto select-none">
        <span>Powered by Firebase & Google Cloud</span>
        <span className="text-amber-500/50 hidden sm:inline">Tournament Ready v2.4.0</span>
        <span>Deployment: Live Production</span>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <MainAppContent />
    </FirebaseProvider>
  );
}
