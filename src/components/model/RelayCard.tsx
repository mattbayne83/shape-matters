import type { RelayLevel } from '../../types';

interface RelayCardProps {
  level: RelayLevel;
  index: number;
  fidelityPct: number;
}

export function RelayCard({ level, index, fidelityPct }: RelayCardProps) {
  // Opacity mirrors signal fidelity — floor at 0.35 so decayed cards stay readable
  const opacity = Math.max(0.35, fidelityPct / 100);

  return (
    <div
      className="border border-stone-200 rounded-xl p-4 bg-white transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* Level badge + fidelity */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
          L{index + 1}
        </span>
        <span className="text-xs font-semibold text-stone-700">{level.role}</span>
        <span className="text-[10px] font-mono text-stone-400 ml-auto">
          {fidelityPct.toFixed(0)}%
        </span>
      </div>

      {/* Distorted message */}
      <p className="text-sm text-stone-800 leading-relaxed mb-2">
        {level.message}
      </p>

      {/* Lost details + added framing tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {level.lostDetails.map((d) => (
          <span key={d} className="text-[10px] text-stone-400 line-through">
            {d}
          </span>
        ))}
        {level.addedFraming.map((f) => (
          <span key={f} className="text-[10px] text-ember font-medium">
            +{f}
          </span>
        ))}
      </div>

      {/* Incentive annotation */}
      <p className="text-[11px] italic text-stone-400 leading-snug">
        {level.incentive}
      </p>
    </div>
  );
}
