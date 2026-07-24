import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Home, Utensils, Package, Users, RotateCcw } from 'lucide-react';
import { useAppStore } from './store/appStore';
import RoleSwitcher from './components/shared/RoleSwitcher';
import PinModal from './components/shared/PinModal';
import ParentDashboard from './components/parent/ParentDashboard';
import KidDashboard from './components/kid/KidDashboard';
import type { DashboardRole } from './types';

const pageVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 60, scale: 0.98 }),
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 60, scale: 0.98 }),
};

function AppContent() {
  const currentRole = useAppStore(s => s.currentRole);
  const switchRole = useAppStore(s => s.switchRole);
  const isParentAuthenticated = useAppStore(s => s.isParentAuthenticated);
  const logoutParent = useAppStore(s => s.logoutParent);
  const resetAllData = useAppStore(s => s.resetAllData);
  const [showPin, setShowPin] = useState(false);
  const [direction, setDirection] = useState(1);
  const [showReset, setShowReset] = useState(false);

  const isParent = currentRole === 'parent';

  // Auto-lock parent dashboard after 2 minutes inactivity
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LOCK_TIMEOUT = 120000;

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (isParent && isParentAuthenticated) {
      inactivityTimer.current = setTimeout(() => {
        logoutParent();
        switchRole('kid');
      }, LOCK_TIMEOUT);
    }
  }, [isParent, isParentAuthenticated, logoutParent, switchRole]);

  useEffect(() => {
    if (!isParent || !isParentAuthenticated) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isParent, isParentAuthenticated, resetInactivityTimer]);

  const handleRoleSwitch = (role: DashboardRole) => {
    if (role === 'parent') {
      setShowPin(true);
    } else {
      setDirection(-1);
      switchRole('kid');
      logoutParent();
    }
  };

  const handlePinSuccess = () => {
    setDirection(1);
    switchRole('parent');
    setShowPin(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
      isParent
        ? 'bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-slate-50'
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 transition-colors duration-500 shadow-lg ${
        isParent
          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
          : 'bg-gradient-to-r from-teal-500 to-emerald-500'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isParent ? 0 : [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-9 h-9 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <Leaf size={20} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-white font-black text-xl leading-none tracking-tight">KidEats</h1>
              <p className="text-white/70 text-xs leading-none hidden sm:block">
                {isParent ? 'Parent Dashboard' : 'Healthy & Fun!'}
              </p>
            </div>
          </div>
          <RoleSwitcher role={currentRole} onSwitch={handleRoleSwitch} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        <main className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {isParent && isParentAuthenticated ? (
              <motion.div
                key="parent"
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <ParentDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="kid"
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <KidDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg" aria-label="Mobile navigation">
        <div className="flex items-center justify-around px-2 py-1">
          <button className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] text-gray-400" aria-label="Home">
            <Home size={20} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] text-gray-400" aria-label="Explore">
            <Utensils size={20} />
            <span className="text-xs font-medium">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] text-gray-400" aria-label="Orders">
            <Package size={20} />
            <span className="text-xs font-medium">Orders</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] text-gray-400" aria-label="Profile">
            <Users size={20} />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block text-center py-3">
        <div className="flex items-center justify-center gap-4">
          <p className={`text-xs ${isParent ? 'text-amber-400' : 'text-emerald-400'} font-medium`}>
            Eat healthy, earn points, become a champion!
          </p>
          <button
            onClick={() => setShowReset(true)}
            className="text-xs text-gray-400 hover:text-red-500 font-medium flex items-center gap-1"
          >
            <RotateCcw size={10} />
            Reset All Data
          </button>
        </div>
      </footer>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPin && (
          <PinModal
            onSuccess={handlePinSuccess}
            onCancel={() => setShowPin(false)}
          />
        )}
      </AnimatePresence>

      {/* Reset confirmation */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReset(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">Reset All Data?</h3>
              <p className="text-sm text-gray-500 mb-4">This will clear all profiles, orders, schedules, and notifications. This cannot be undone.</p>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => { resetAllData(); setShowReset(false); }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl min-h-[48px]"
                >
                  Reset Everything
                </motion.button>
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl min-h-[48px]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useAppStore.persist.hasHydrated());
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Leaf size={48} className="text-teal-500" />
          </motion.div>
          <p className="text-lg font-bold text-gray-700">Loading KidEats...</p>
          <p className="text-sm text-gray-400 mt-1">Restoring your data</p>
        </div>
      </div>
    );
  }

  return <AppContent />;
}
