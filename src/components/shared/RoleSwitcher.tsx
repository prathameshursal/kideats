import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import type { DashboardRole } from '../../types';

interface Props {
  role: DashboardRole;
  onSwitch: (role: DashboardRole) => void;
}

export default function RoleSwitcher({ role, onSwitch }: Props) {
  return (
    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full p-1" role="tablist" aria-label="Switch view">
      <motion.button
        onClick={() => onSwitch('kid')}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all min-h-[44px] ${
          role === 'kid' ? 'bg-white text-teal-700 shadow-sm' : 'text-white/80 hover:text-white'
        }`}
        role="tab"
        aria-selected={role === 'kid'}
        aria-label="Kid View"
      >
        <Sparkles size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Kid</span>
      </motion.button>
      <motion.button
        onClick={() => onSwitch('parent')}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all min-h-[44px] ${
          role === 'parent' ? 'bg-white text-amber-700 shadow-sm' : 'text-white/80 hover:text-white'
        }`}
        role="tab"
        aria-selected={role === 'parent'}
        aria-label="Parent View"
      >
        <Shield size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Parent</span>
      </motion.button>
    </div>
  );
}
