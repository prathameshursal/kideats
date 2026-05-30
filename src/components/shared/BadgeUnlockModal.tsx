import { motion } from 'framer-motion';
import { BADGE_DEFS } from '../../types';
import type { KidProfile } from '../../types';

interface Props {
  kid: KidProfile;
  onClose: () => void;
}

function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#F59E0B', '#14B8A6', '#3B82F6', '#EF4444', '#EC4899'];
  const color = colors[index % colors.length];
  const x = Math.random() * 300 - 150;
  const rotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{ backgroundColor: color, left: '50%', top: '50%' }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
      animate={{
        x: [0, x * 0.5, x],
        y: [0, -80, 120],
        rotate: [0, rotation * 0.5, rotation],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  );
}

export default function BadgeUnlockModal({ kid, onClose }: Props) {
  const newBadges = BADGE_DEFS.filter(b => kid.badges.includes(b.id));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 w-80 text-center shadow-2xl relative overflow-hidden"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}

        <motion.div
          className="text-5xl mb-3"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          {newBadges.length > 0 ? newBadges[newBadges.length - 1].icon : '🏆'}
        </motion.div>

        <h3 className="text-xl font-black text-gray-800 mb-1">Badge Unlocked!</h3>
        {newBadges.map(b => (
          <div key={b.id} className="mb-2">
            <p className="text-lg font-bold text-amber-600">{b.name}</p>
            <p className="text-sm text-gray-500">{b.description}</p>
          </div>
        ))}

        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 mt-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-2xl min-h-[48px]"
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
