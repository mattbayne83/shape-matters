import { useMemo } from 'react';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { calcAutonomyScore } from '../../lib/autonomy';
import { healthBandColor } from '../../lib/healthScores';

interface AuthoritySpectrumProps {
  dci: number;
  levels: number;
  /** Effective autonomy score from blended model — positions the "You" dot */
  displayScore?: number;
}

const HEALTH_BANDS: { label: string; color: string }[] = [
  { label: 'Expired', color: '#dc2626' },
  { label: 'Stale',   color: '#E05A1B' },
  { label: 'Aging',   color: '#F4A261' },
  { label: 'Fresh',   color: '#A8967A' },
  { label: 'Live',    color: '#44403c' },
];

export function AuthoritySpectrum({ dci, levels, displayScore }: AuthoritySpectrumProps) {
  const autonomy = useMemo(() => calcAutonomyScore(dci, levels), [dci, levels]);
  const effectiveScore = displayScore ?? autonomy.score;

  const companyDots = useMemo(
    () =>
      REFERENCE_COMPANIES.filter((c) => c.dci != null && c.levels != null).map((c) => {
        const score = calcAutonomyScore(c.dci!, c.levels).score;
        return {
          id: c.id,
          name: c.name,
          score,
          color: c.color,
        };
      }),
    []
  );

  return (
    <div className="flex flex-col h-full justify-center gap-5 px-2">
      {/* ── Autonomy Spectrum ── */}
      <div>

        <div className="relative px-2">
          {/* "You" label above dot */}
          <div
            className="absolute z-20 flex flex-col items-center transition-all duration-300"
            style={{
              left: `${effectiveScore}%`,
              transform: 'translateX(-50%)',
              top: '-22px',
            }}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600">You</span>
          </div>

          {/* 5-segment health band track */}
          <div className="flex h-4 rounded-full overflow-hidden relative">
            {HEALTH_BANDS.map((band) => (
              <div
                key={band.label}
                className="flex-1"
                style={{ backgroundColor: band.color, opacity: 0.35 }}
              />
            ))}
            {/* You dot — prominent, overlaid on track */}
            <div
              className="absolute top-1/2 z-20 w-6 h-6 rounded-full border-[3px] border-white transition-all duration-300"
              style={{
                left: `${effectiveScore}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: healthBandColor(effectiveScore),
                boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px ${healthBandColor(effectiveScore)}33`,
              }}
            />
          </div>

          {/* Band labels below track */}
          <div className="flex mt-1.5">
            {HEALTH_BANDS.map((band) => (
              <div key={band.label} className="flex-1 text-center">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-500">{band.label}</span>
              </div>
            ))}
          </div>

          {/* Company dots */}
          <div className="relative h-9 mt-2">
            {companyDots.map((c) => (
              <div
                key={c.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${c.score}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full border border-white/80 shadow-sm"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-[8px] text-stone-400 whitespace-nowrap mt-0.5">
                  {c.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score annotation */}
        <p className="text-[11px] text-stone-400 text-center mt-2">
          Your autonomy score:{' '}
          <span className="font-bold text-stone-600">{effectiveScore}</span>
          {effectiveScore !== autonomy.score && (
            <span className="text-stone-400">
              {' '}({autonomy.score} structural + team routing boost)
            </span>
          )}
        </p>
      </div>

      {/* ── Depth Leverage ── */}
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <div className="bg-stone-50 rounded-lg px-4 py-2 text-center shrink-0">
          <div className="text-[9px] text-stone-400 uppercase font-semibold tracking-wide mb-0.5">
            Structural discount
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-stone-900">
            &times;{autonomy.depthDiscount.toFixed(2)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-stone-500 leading-snug">
            Each +10 DCI ={' '}
            <span className="font-bold text-stone-700">
              +{Math.round(10 * autonomy.depthDiscount)} effective autonomy
            </span>
          </p>
          <p className="text-[11px] text-stone-500 leading-snug">
            {levels} levels of coordination overhead erode{' '}
            <span className="font-bold text-stone-700">
              {Math.round((1 - autonomy.depthDiscount) * 100)}%
            </span>{' '}
            of formal authority
          </p>
        </div>

        {effectiveScore < 50 && (
          <div className="bg-orange-50 border border-orange-200/50 rounded-lg px-3 py-2 shrink-0">
            <p className="text-[11px] text-stone-600 leading-snug">
              Consider distributing decision authority to ICs closest to the work
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
