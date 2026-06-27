import { motion } from 'framer-motion';

export default function SectionHeader({ subtitle, title, highlight, description, align = 'center' }) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8 }}
      className={`flex flex-col ${alignClass} mb-14`}
    >
      {subtitle && (
        <span className="text-gold-500 font-accent text-sm tracking-[0.4em] uppercase mb-3">
          {subtitle}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
        {title}{' '}
        {highlight && <span className="text-gold-400">{highlight}</span>}
      </h2>
      <div className={`w-20 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mt-4 ${align === 'center' ? 'mx-auto' : ''}`} />
      {description && (
        <p className="text-platinum-400 text-base md:text-lg mt-4 max-w-2xl font-accent italic">
          {description}
        </p>
      )}
    </motion.div>
  );
}
