import { fidelityColor, invertedBarColor } from '../../lib/fidelityColor';

interface LayerDiagramProps {
  levels: number;
  fidelityRate: number;
  /** Optional override color — if omitted, uses semantic fidelityColor per layer */
  color?: string;
  /** Compact mode for embedding in cards */
  compact?: boolean;
  /** Light-on-dark label text and bar colors for inverted backgrounds */
  inverted?: boolean;
  /** Show cascading pulse overlay on parent group-hover */
  hoverPulse?: boolean;
}

export function LayerDiagram({ levels, fidelityRate, compact, inverted, hoverPulse }: LayerDiagramProps) {
  const layers = Array.from({ length: levels }, (_, i) => {
    // Reverse the DOM rendering order so L0 is at the bottom
    const invertedIndex = levels - 1 - i;
    const fidelity = Math.pow(fidelityRate / 100, invertedIndex) * 100;
    return { level: invertedIndex, fidelity };
  });

  const barHeight = compact ? 'h-2.5' : 'h-3.5';
  const gap = compact ? 'gap-px' : 'gap-0.5';
  const labelColor = inverted ? 'text-stone-400' : 'text-stone-500';

  return (
    <div className={`flex flex-col items-center ${gap} py-2`} role="img" aria-label={`Layer diagram showing signal fidelity across ${levels} levels at ${fidelityRate}% per-layer retention`}>
      {layers.map((l, i) => {
        // Width = fidelity percentage (signal retained)
        // At L0 fidelity=100%, bar is full width. Deeper layers shrink.
        const widthPct = Math.max(l.fidelity, 4); // min 4% for visibility
        const barColor = inverted ? invertedBarColor(l.fidelity) : fidelityColor(l.fidelity);

        return (
          <div key={l.level} className="flex items-center gap-1.5 w-full">
            <div className={`text-[10px] ${labelColor} w-6 text-left shrink-0`}>
              L{l.level}
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className={`${barHeight} rounded-full transition-all duration-500 ease-out ${hoverPulse ? 'relative overflow-hidden' : ''}`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: barColor,
                }}
              >
                {hoverPulse && (
                  <div
                    className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-[gemba-pulse_1.2s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                )}
              </div>
            </div>
            <div className={`text-[10px] ${labelColor} font-mono w-8 text-right shrink-0`}>
              {l.fidelity.toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
