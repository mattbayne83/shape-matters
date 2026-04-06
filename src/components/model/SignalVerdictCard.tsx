import { fidelityColor } from '../../lib/fidelityColor';

interface SignalVerdictCardProps {
  fidelityPct: number;
  relayCount: number;
  finalMessage: string;
}

function verdictLabel(pct: number): string {
  if (pct >= 80) return 'Strong signal — leadership sees most of the picture';
  if (pct >= 60) return 'Moderate decay — key details are blurred';
  if (pct >= 40) return 'Significant loss — the message has been reshaped';
  if (pct >= 20) return 'Severe decay — only the sentiment survived';
  return 'Near-total loss — the original signal is unrecoverable';
}

export function SignalVerdictCard({ fidelityPct, relayCount, finalMessage }: SignalVerdictCardProps) {
  const color = fidelityColor(fidelityPct, true);

  return (
    <div
      className="border-2 rounded-xl p-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded text-white"
          style={{ backgroundColor: color }}
        >
          TOP
        </span>
        <span className="text-xs font-semibold text-stone-700">What Arrived at the Top</span>
      </div>

      <p className="text-sm text-stone-800 leading-relaxed mb-3 italic">
        &ldquo;{finalMessage}&rdquo;
      </p>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold font-mono" style={{ color }}>
          {fidelityPct.toFixed(0)}%
        </span>
        <span className="text-xs text-stone-500">
          signal fidelity after {relayCount} relay{relayCount !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-[11px] text-stone-400 mt-1">{verdictLabel(fidelityPct)}</p>
    </div>
  );
}
