import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-obsidian-950 flex flex-col items-center justify-center">
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_60px_rgba(212,160,23,0.4)]">
          <span className="font-display text-obsidian-950 text-3xl font-bold">G</span>
        </div>

        {/* Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-3 rounded-full border-2 border-transparent border-t-gold-500 border-r-gold-500/30"
        />

        {/* Pulsing Glow */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-6 rounded-full bg-gold-500/10"
        />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl text-white mb-2">Grand Palatial</h2>
        <p className="text-gold-500/60 text-xs tracking-[0.4em] uppercase">Loading Experience</p>
      </motion.div>

      {/* Loading Dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-gold-500"
          />
        ))}
      </div>
    </div>
  );
}
