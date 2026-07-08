import React, { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { motion } from 'motion/react';
import { 
  Check, 
  Copy,
  Lock,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile, user } = useFirebase();
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  // Format creation timestamp
  const getRegDate = () => {
    if (!profile.createdAt) return 'Oct 24, 2023';
    const date = profile.createdAt.seconds 
      ? new Date(profile.createdAt.seconds * 1000) 
      : new Date(profile.createdAt);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = () => {
    if (!profile.realName) return 'PL';
    const parts = profile.realName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return profile.realName.substring(0, 2).toUpperCase();
  };

  const copyToClipboard = () => {
    const text = `🎮 *BGMI Tournament Registration Status* 🎮
--------------------------------------
✅ *Status:* Registered Successfully
👤 *Real Name:* ${profile.realName}
📧 *Email:* ${profile.email}
🆔 *BGMI ID:* ${profile.bgmiId}
👾 *IGN:* ${profile.bgmiName}
💳 *UPI ID:* ${profile.upiId}
📸 *Instagram:* @${profile.instagramId}
📞 *WhatsApp:* ${profile.whatsappNumber}
📅 *Date:* ${getRegDate()}
--------------------------------------
_Portal powered by BGMI Champions_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8"
    >
      {/* Left Column: Registered Card Details */}
      <div className="md:col-span-7 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black uppercase tracking-tight italic text-white">
            Registry <span className="text-amber-500 underline decoration-4 underline-offset-4">Verified</span>
          </h1>
          <p className="text-zinc-500 text-sm">Your tournament registration is locked and secure.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-br from-amber-600 to-amber-900 relative">
            <div className="absolute -bottom-10 left-6 w-20 h-20 bg-zinc-950 rounded-xl border-4 border-zinc-900 flex items-center justify-center">
              <span className="text-3xl font-black text-amber-500">{getInitials()}</span>
            </div>
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-white">Tier 1 Verified</span>
            </div>
          </div>

          <div className="pt-12 p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.realName}</h2>
              <p className="text-zinc-500 text-xs font-mono">{profile.email}</p>
            </div>

            {/* Profile Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">BGMI In-Game Name</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.bgmiName}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">BGMI Player ID</p>
                <p className="text-sm font-semibold font-mono text-amber-500 mt-0.5">{profile.bgmiId}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">WhatsApp Number</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{profile.whatsappNumber}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">UPI ID Settlement</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{profile.upiId}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Instagram ID</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">@{profile.instagramId}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Account Created</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{getRegDate()}</p>
              </div>
            </div>

            {/* Security Rules Active Visual Progress */}
            <div className="flex flex-col gap-2 p-3 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Security Rules Active</span>
                <span className="text-[10px] text-zinc-600 font-mono italic">Cloud Firestore Enabled</span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-full"></div>
              </div>
            </div>

            {/* Copy Gamer Card Button */}
            <button
              id="copy-card-btn"
              onClick={copyToClipboard}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY GAMER CARD</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Security Protocol & Rules Info */}
      <div className="md:col-span-5 flex flex-col gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Security Protocol</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Only the authenticated Google account owner can view or modify this specific gamer profile.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Duplicate BGMI ID registrations are strictly blocked by cloud-side triggers to ensure tournament integrity.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                System administrators can verify individual player credentials for prize pool distributions and rankings.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Need to modify your details?</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Registered profiles are locked to prevent tampering during tournament bracket updates. For urgent edits, contact an administrator or file a support query via Discord.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
