import React from 'react';
import { useFirebase } from './FirebaseProvider';
import { motion } from 'motion/react';
import { ShieldAlert, LogOut } from 'lucide-react';

export const BlockedView: React.FC = () => {
  const { signOutUser, profile } = useFirebase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center flex flex-col gap-5">
        
        {/* Warning Icon Box */}
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-red-500 uppercase">
            REGISTRY SUSPENDED
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
            Account Blocked
          </p>
        </div>
        
        <div className="text-sm text-zinc-400 leading-relaxed space-y-3">
          <p>
            Your BGMI tournament registration for profile <strong className="text-white">"{profile?.bgmiName}"</strong> has been suspended by the administrator.
          </p>
          <p className="text-xs text-zinc-500">
            For further queries or to appeal this suspension, please contact the tournament operations team or file a ticket in the official Discord channel.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={signOutUser}
          className="w-full mt-4 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};
