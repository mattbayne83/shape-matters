import type { ResponseRegime } from '../../types';

interface ThreeFuturesProps {
  dampingRatio: number;
  overshootPct: number;
  settlingTimeWeeks: number;
  regime: ResponseRegime;
}

interface FutureCard {
  id: ResponseRegime;
  title: string;
  titleColor: string;
  borderColor: string;
  steps: { text: string; dotColor: string }[];
}

const FUTURES: FutureCard[] = [
  {
    id: 'under-damped',
    title: 'Too Fast',
    titleColor: '#DC2626',
    borderColor: 'border-red-200',
    steps: [
      { text: 'CEO announces pivot', dotColor: '#E05A1B' },
      { text: 'Teams overcommit, abandon existing work', dotColor: '#DC2626' },
      { text: 'Overshoot — "wait, not THAT far"', dotColor: '#DC2626' },
      { text: 'Swing back, confusion, mixed signals', dotColor: '#D97706' },
      { text: 'Second correction, fatigue sets in', dotColor: '#D97706' },
      { text: 'Eventually settles (6+ months)', dotColor: '#16A34A' },
    ],
  },
  {
    id: 'critically-damped',
    title: 'Right-Sized',
    titleColor: '#16A34A',
    borderColor: 'border-green-200',
    steps: [
      { text: 'CEO announces pivot', dotColor: '#E05A1B' },
      { text: 'Org mobilizes, good initial momentum', dotColor: '#E05A1B' },
      { text: 'Slight overshoot — some wasted effort', dotColor: '#D97706' },
      { text: 'One correction cycle', dotColor: '#D97706' },
      { text: 'Aligned and executing', dotColor: '#16A34A' },
    ],
  },
  {
    id: 'over-damped',
    title: 'Too Slow',
    titleColor: '#a8a29e',
    borderColor: 'border-stone-200',
    steps: [
      { text: 'CEO announces pivot', dotColor: '#E05A1B' },
      { text: 'Committees form, reviews begin', dotColor: '#a8a29e' },
      { text: 'Middle layers dilute urgency', dotColor: '#a8a29e' },
      { text: 'Front line barely notices', dotColor: '#a8a29e' },
      { text: '12+ months, still only ~60% aligned', dotColor: '#a8a29e' },
    ],
  },
];

export function ThreeFutures({
  dampingRatio,
  overshootPct,
  settlingTimeWeeks,
  regime,
}: ThreeFuturesProps) {
  let verdict: string;
  if (regime === 'under-damped') {
    verdict = `Your org overcommits by ~${Math.round(overshootPct)}% on a major pivot before correcting. Expect multiple correction cycles and ~${Math.round(settlingTimeWeeks)} weeks to full alignment.`;
  } else if (regime === 'critically-damped') {
    verdict = `Your org converges efficiently — minor overshoot of ~${Math.round(overshootPct)}%, aligned in ~${Math.round(settlingTimeWeeks)} weeks. This is near-optimal response.`;
  } else {
    verdict = `Your org crawls toward change. No overshoot, but after 12 months you may still be only ~60% aligned. Settling time: ~${Math.round(settlingTimeWeeks)} weeks.`;
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-3 shrink-0">
        Future Scenarios
      </h3>
      <div className="grid grid-cols-1 gap-2 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        {FUTURES.map((card) => {
          const isActive = card.id === regime;
          return (
            <div
              key={card.id}
              className={`
                rounded-lg border px-3 py-2.5 transition-all duration-300
                ${isActive
                  ? `${card.borderColor} bg-white shadow-sm ring-2 ring-stone-200`
                  : 'border-stone-100 bg-stone-50/50 opacity-50'}
              `}
            >
              <div className="flex items-baseline gap-2 mb-1.5">
                <p className="text-xs font-bold" style={{ color: card.titleColor }}>
                  {card.title}
                </p>
                <p className="text-[9px] text-stone-400">
                  ζ {card.id === 'under-damped' ? '< 0.7' : card.id === 'critically-damped' ? '0.7–1.3' : '> 1.3'}
                  {isActive && (
                    <span className="ml-1 font-bold text-stone-600">
                      ({dampingRatio.toFixed(2)})
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                {card.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-stone-500 leading-tight">
                    <span
                      className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: step.dotColor }}
                    />
                    {step.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-stone-100 shrink-0">
        <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
          {verdict}
        </p>
      </div>
    </div>
  );
}
