import React, { useState } from 'react';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Save, User, Hash, Gamepad2, CreditCard, Instagram, Phone } from 'lucide-react';

interface EditUserModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const [realName, setRealName] = useState(user.realName);
  const [bgmiId, setBgmiId] = useState(user.bgmiId);
  const [bgmiName, setBgmiName] = useState(user.bgmiName);
  const [upiId, setUpiId] = useState(user.upiId);
  const [instagramId, setInstagramId] = useState(user.instagramId);
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validation
    const cleanRealName = realName.trim();
    const cleanBgmiId = bgmiId.trim();
    const cleanBgmiName = bgmiName.trim();
    const cleanUpiId = upiId.trim();
    const cleanInstagramId = instagramId.trim().replace(/^@/, '');
    const cleanWhatsapp = whatsappNumber.trim();

    if (!cleanRealName || !cleanBgmiId || !cleanBgmiName || !cleanUpiId || !cleanInstagramId || !cleanWhatsapp) {
      setError("All fields are required.");
      setSaving(false);
      return;
    }

    if (!/^\d+$/.test(cleanBgmiId)) {
      setError("BGMI Character ID must contain only digits.");
      setSaving(false);
      return;
    }

    if (!/^\d{10}$/.test(cleanWhatsapp)) {
      setError("WhatsApp Number must be exactly 10 digits.");
      setSaving(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.uid);

      // Check if BGMI ID changed and is unique
      if (cleanBgmiId !== user.bgmiId) {
        const bgmiIdRef = doc(db, 'bgmi_ids', cleanBgmiId);
        const bgmiIdSnap = await getDoc(bgmiIdRef);
        
        if (bgmiIdSnap.exists() && bgmiIdSnap.data()?.uid !== user.uid) {
          setError(`BGMI Character ID ${cleanBgmiId} is already registered to another player.`);
          setSaving(false);
          return;
        }

        // Reserve new BGMI ID and delete old one
        const oldBgmiIdRef = doc(db, 'bgmi_ids', user.bgmiId);
        batch.set(bgmiIdRef, { uid: user.uid });
        batch.delete(oldBgmiIdRef);
      }

      // Update user document
      const updatedProfile: Partial<UserProfile> = {
        realName: cleanRealName,
        bgmiId: cleanBgmiId,
        bgmiName: cleanBgmiName,
        upiId: cleanUpiId,
        instagramId: cleanInstagramId,
        whatsappNumber: cleanWhatsapp,
      };

      batch.update(userRef, updatedProfile);
      await batch.commit();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating profile as admin:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Edit Player Profile
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                UID: {user.uid}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-mono">
                {error}
              </div>
            )}

            {/* Real Name */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-600" />
                <span>Real Name</span>
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                maxLength={100}
                placeholder="Enter player's real name"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white rounded-xl placeholder-zinc-700 outline-none transition-all"
                required
              />
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1.5">
                Email Address (Google Identity - Read Only)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 bg-zinc-950/40 border border-zinc-900 text-sm text-zinc-500 rounded-xl cursor-not-allowed outline-none select-all"
              />
            </div>

            {/* BGMI Character ID */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-zinc-600" />
                <span>BGMI Character ID</span>
              </label>
              <input
                type="text"
                value={bgmiId}
                onChange={(e) => setBgmiId(e.target.value)}
                maxLength={20}
                placeholder="e.g. 5123456789"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white rounded-xl placeholder-zinc-700 outline-none transition-all"
                required
              />
            </div>

            {/* BGMI In-Game Name */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-zinc-600" />
                <span>BGMI In-Game Name (IGN)</span>
              </label>
              <input
                type="text"
                value={bgmiName}
                onChange={(e) => setBgmiName(e.target.value)}
                maxLength={100}
                placeholder="Enter player's in-game name"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white rounded-xl placeholder-zinc-700 outline-none transition-all"
                required
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-zinc-600" />
                <span>UPI ID (Prize Destination)</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                maxLength={100}
                placeholder="e.g. payname@upi"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white rounded-xl placeholder-zinc-700 outline-none transition-all"
                required
              />
            </div>

            {/* WhatsApp & Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-600" />
                  <span>WhatsApp Number</span>
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  maxLength={10}
                  placeholder="10-digit number"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white rounded-xl placeholder-zinc-700 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Instagram Username</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600 text-sm select-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={instagramId}
                    onChange={(e) => setInstagramId(e.target.value)}
                    maxLength={100}
                    placeholder="username"
                    className="w-full pl-7 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white rounded-xl placeholder-zinc-700 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase rounded-lg tracking-widest text-xs transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
