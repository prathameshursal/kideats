import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Delete, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinModal({ onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const authenticateParent = useAppStore(s => s.authenticateParent);
  const pinAttempts = useAppStore(s => s.pinAttempts);
  const pinLockoutUntil = useAppStore(s => s.pinLockoutUntil);
  const [lockRemaining, setLockRemaining] = useState(0);

  useEffect(() => {
    if (pinLockoutUntil <= Date.now()) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((pinLockoutUntil - Date.now()) / 1000));
      setLockRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [pinLockoutUntil]);

  const isLocked = pinLockoutUntil > Date.now();

  const handleDigit = (d: string) => {
    if (pin.length >= 4 || isLocked) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (authenticateParent(next)) {
        setTimeout(onSuccess, 200);
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => { setPin(''); setShake(false); }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Parent PIN entry"
    >
      <motion.div
        className="bg-white rounded-3xl p-8 w-80 shadow-2xl relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-3">
            <Shield className="text-amber-600" size={28} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Parent Access</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your 4-digit PIN</p>
          <p className="text-xs text-gray-400 mt-0.5">(Default: 1234)</p>
        </div>

        {isLocked ? (
          <div className="text-center py-4">
            <AlertTriangle size={32} className="mx-auto text-red-400 mb-2" />
            <p className="text-sm font-bold text-red-600">Too many attempts</p>
            <p className="text-xs text-gray-500 mt-1">Try again in {lockRemaining} seconds</p>
          </div>
        ) : (
          <>
            <motion.div
              className="flex justify-center gap-3 mb-4"
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    pin.length > i ? (error ? 'bg-red-500' : 'bg-amber-500') : 'bg-gray-200'
                  }`}
                />
              ))}
            </motion.div>

            {error && (
              <p className="text-center text-red-500 text-sm mb-3 font-medium" role="alert">
                Wrong PIN ({3 - pinAttempts} attempts left)
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {['1','2','3','4','5','6','7','8','9'].map(d => (
                <motion.button
                  key={d}
                  onClick={() => handleDigit(d)}
                  whileTap={{ scale: 0.9 }}
                  className="h-14 rounded-2xl bg-gray-50 hover:bg-amber-50 text-gray-800 text-xl font-semibold transition-colors border border-gray-100 min-h-[48px]"
                >
                  {d}
                </motion.button>
              ))}
              <div />
              <motion.button
                onClick={() => handleDigit('0')}
                whileTap={{ scale: 0.9 }}
                className="h-14 rounded-2xl bg-gray-50 hover:bg-amber-50 text-gray-800 text-xl font-semibold transition-colors border border-gray-100 min-h-[48px]"
              >
                0
              </motion.button>
              <motion.button
                onClick={handleDelete}
                whileTap={{ scale: 0.9 }}
                className="h-14 rounded-2xl bg-gray-50 hover:bg-red-50 text-gray-500 transition-colors border border-gray-100 flex items-center justify-center min-h-[48px]"
                aria-label="Delete"
              >
                <Delete size={20} />
              </motion.button>
            </div>
          </>
        )}

        <button
          onClick={onCancel}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 font-medium mt-4 min-h-[44px]"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
