import React, { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Loader2,
  Lock
} from 'lucide-react';

export const RegistrationForm: React.FC = () => {
  const { registerUser, checkBgmiIdExists, profileLoading } = useFirebase();

  // Form fields
  const [realName, setRealName] = useState('');
  const [bgmiId, setBgmiId] = useState('');
  const [bgmiName, setBgmiName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // UI state
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittingError, setSubmittingError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmittingError(null);

    // 1. Basic Trim & Check Empty Fields
    const trimmedRealName = realName.trim();
    const trimmedBgmiId = bgmiId.trim();
    const trimmedBgmiName = bgmiName.trim();
    const trimmedUpiId = upiId.trim();
    const trimmedInstagramId = instagramId.trim();
    const trimmedWhatsappNumber = whatsappNumber.trim();

    if (!trimmedRealName || !trimmedBgmiId || !trimmedBgmiName || !trimmedUpiId || !trimmedInstagramId || !trimmedWhatsappNumber) {
      setValidationError("All fields are required.");
      return;
    }

    // 2. Validate BGMI ID (Numeric)
    if (!/^[0-9]+$/.test(trimmedBgmiId)) {
      setValidationError("BGMI ID must contain digits only.");
      return;
    }

    // 3. Validate WhatsApp (exactly 10 digits)
    if (!/^[0-9]{10}$/.test(trimmedWhatsappNumber)) {
      setValidationError("WhatsApp Number must be exactly 10 digits.");
      return;
    }

    // 4. Check UPI ID basic format (needs at least '@' in it)
    if (!trimmedUpiId.includes('@')) {
      setValidationError("Please enter a valid UPI ID (e.g., username@bank).");
      return;
    }

    try {
      setIsCheckingDuplicate(true);
      // 5. Prevent Duplicate BGMI ID Check
      const isTaken = await checkBgmiIdExists(trimmedBgmiId);
      setIsCheckingDuplicate(false);

      if (isTaken) {
        setValidationError(`BGMI ID ${trimmedBgmiId} is already registered by another player.`);
        return;
      }

      // 6. Register!
      await registerUser({
        realName: trimmedRealName,
        bgmiId: trimmedBgmiId,
        bgmiName: trimmedBgmiName,
        upiId: trimmedUpiId,
        instagramId: trimmedInstagramId,
        whatsappNumber: trimmedWhatsappNumber,
      });

    } catch (err: any) {
      setIsCheckingDuplicate(false);
      console.error("Submit error:", err);
      setSubmittingError(err.message || "Failed to complete registration. Please try again.");
    }
  };

  const isBtnLoading = profileLoading || isCheckingDuplicate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tight italic text-white">
          Complete Your <span className="text-amber-500 underline decoration-4 underline-offset-4">Registration</span>
        </h1>
        <p className="text-zinc-500 text-sm">Sync your mobile gaming credentials for tournament eligibility.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-5 shadow-2xl relative">
        {/* Validation Errors */}
        {validationError && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-xl flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{validationError}</div>
          </div>
        )}

        {/* Submitting Errors */}
        {submittingError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{submittingError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="registration-form">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Real Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="realName" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Real Name
              </label>
              <input
                id="realName"
                type="text"
                required
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Shivam Gangwar"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="flex flex-col gap-2">
              <label htmlFor="whatsappNumber" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                WhatsApp Number
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                required
                maxLength={10}
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BGMI ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="bgmiId" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                BGMI Player ID
              </label>
              <input
                id="bgmiId"
                type="text"
                required
                value={bgmiId}
                onChange={(e) => setBgmiId(e.target.value.replace(/\D/g, ''))}
                placeholder="Numeric ID Only"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            {/* BGMI Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="bgmiName" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                BGMI In-Game Name
              </label>
              <input
                id="bgmiName"
                type="text"
                required
                value={bgmiName}
                onChange={(e) => setBgmiName(e.target.value)}
                placeholder="Example: SlayerX"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* UPI ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="upiId" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                UPI ID (Payment Settlement)
              </label>
              <input
                id="upiId"
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="user@upi"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            {/* Instagram ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="instagramId" className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Instagram ID
              </label>
              <input
                id="instagramId"
                type="text"
                required
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                placeholder="@username"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={isBtnLoading}
            className="mt-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase py-3 rounded-lg tracking-widest text-sm transition-all active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isBtnLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>SAVING PROTOCOL...</span>
              </>
            ) : (
              <>
                <span>Confirm Registration</span>
              </>
            )}
          </button>

        </form>
      </div>
    </motion.div>
  );
};
