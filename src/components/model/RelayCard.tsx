import { motion } from 'framer-motion';
import type { RelayLevel } from '../../types';

interface RelayCardProps {
  level: RelayLevel;
  index: number;
  isCustom?: boolean;
}

export function RelayCard({ level, index, isCustom }: RelayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: index * 0.4,
      }}
      className="border border-stone-200 rounded-xl p-4 bg-white"
    >
      {/* Level badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
          L{index + 1}
        </span>
        <span className="text-xs font-semibold text-stone-700">{level.role}</span>
      </div>

      {/* Distorted message */}
      <p className="text-sm text-stone-800 leading-relaxed mb-2">
        {level.message}
      </p>

      {/* Lost details + added framing tags */}
      {!isCustom && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {level.lostDetails.map((d) => (
            <span
              key={d}
              className="text-[10px] text-stone-400 line-through"
            >
              {d}
            </span>
          ))}
          {level.addedFraming.map((f) => (
            <span
              key={f}
              className="text-[10px] text-ember font-medium"
            >
              +{f}
            </span>
          ))}
        </div>
      )}

      {/* Incentive annotation */}
      <p className="text-[11px] italic text-stone-400 leading-snug">
        {level.incentive}
      </p>
    </motion.div>
  );
}
