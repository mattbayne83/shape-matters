import { useMemo } from 'react';
import { calcLayerDelays, calcMarginalLayerCost } from '../../lib/thermalLag';

interface PropagationDelayProps {
  levels: number;
  decisionCycle: number;
}

/** Interpolate from ember (#E05A1B) to warm-stone (#A8967A) based on 0-1 pct. */
function lagBarColor(pct: number): string {
  const r = Math.round(224 + (168 - 224) * pct);
  const g = Math.round(90 + (150 - 90) * pct);
  const b = Math.round(27 + (122 - 27) * pct);
  return `rgb(${r},${g},${b})`;
}

export function PropagationDelay({ levels, decisionCycle }: PropagationDelayProps) {
  const delays = useMemo(
    () => calcLayerDelays(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const marginalCost = useMemo(
    () => calcMarginalLayerCost(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const maxDelay = delays[delays.length - 1]?.cumulativeDelay || 1;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 shrink-0">
        Propagation Delay
      </h3>
      <p className="text-sm text-stone-400 mb-4 shrink-0">
        How long a strategic signal takes to reach each layer
      </p>

      <div className="space-y-3 flex-1 min-h-0 flex flex-col justify-center px-4">
        {delays.map((d) => {
          const widthPct = maxDelay > 0
            ? Math.max(1, (d.cumulativeDelay / maxDelay) * 100)
            : (d.layer === 0 ? 1 : 0);

          return (
            <div key={d.layer} className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-400 w-28 shrink-0 text-right">
                L{d.layer} · {d.role}
              </span>
              <div className="flex-1 h-8 bg-stone-100 rounded relative overflow-hidden shadow-inner">
                <div
                  className="h-full rounded transition-all duration-500 ease-out shadow-sm"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: lagBarColor(d.cumulativeDelay / Math.max(maxDelay, 1)),
                  }}
                />
              </div>
              <span className="text-xs font-mono text-stone-500 w-16 text-right tabular-nums">
                {d.cumulativeDelay === 0 ? 'Day 0' : `Day ${Math.round(d.cumulativeDelay)}`}
              </span>
            </div>
          );
        })}
      </div>

      {levels > 1 && (
        <p className="text-sm text-stone-500 mt-4 pt-3 border-t border-stone-100">
          Removing 1 layer saves{' '}
          <span className="font-bold font-mono text-stone-700">
            {Math.round(marginalCost)} days
          </span>
        </p>
      )}
    </div>
  );
}
