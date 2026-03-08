import { fidelityColor } from '../../lib/fidelityColor';

interface LayerDiagramProps {
  levels: number;
  fidelityRate: number;
  /** Optional override color — if omitted, uses semantic fidelityColor per layer */
  color?: string;
  /** Compact mode for embedding in cards */
  compact?: boolean;
}

export function LayerDiagram({ levels, fidelityRate, compact }: LayerDiagramProps) {
  const layers = Array.from({ length: levels }, (_, i) => {
    const fidelity = Math.pow(fidelityRate / 100, i) * 100;
    return { level: i, fidelity };
  });

  const barHeight = compact ? 'h-2.5' : 'h-3.5';
  const gap = compact ? 'gap-px' : 'gap-0.5';

  return (
    <div className={`flex flex-col items-center ${gap} py-2`}>
      {layers.map((l) => {
        // Width = fidelity percentage (signal retained)
        // At L0 fidelity=100%, bar is full width. Deeper layers shrink.
        const widthPct = Math.max(l.fidelity, 4); // min 4% for visibility

        return (
          <div key={l.level} className="flex items-center gap-1.5 w-full">
            <div className="text-[10px] text-stone-500 w-6 text-left shrink-0">
              L{l.level}
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className={`${barHeight} rounded-full transition-all duration-500 ease-out`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: fidelityColor(l.fidelity),
                }}
              />
            </div>
            <div className="text-[10px] text-stone-500 font-mono w-8 text-right shrink-0">
              {l.fidelity.toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
