import { useId, useMemo } from 'react';
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
  const uid = useId().replace(/:/g, '');
  // Include inputs so animations restart on slider change
  const kf = `as-${uid}${dci}${levels}${displayScore ?? ''}`;

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const animate = !prefersReducedMotion;

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

  // Stagger timings (ms)
  const BAND_STAGGER = 80;
  const BAND_TOTAL = HEALTH_BANDS.length * BAND_STAGGER; // 400ms
  const DOT_APPEAR = BAND_TOTAL + 100;                   // 500ms
  const COMPANY_START = DOT_APPEAR + 200;                 // 700ms
  const COMPANY_STAGGER = 60;
  const METRICS_APPEAR = COMPANY_START + companyDots.length * COMPANY_STAGGER + 100;

  const keyframes = `
    @keyframes ${kf}-band { from { transform: scaleX(0); opacity: 0 } to { transform: scaleX(1); opacity: 0.35 } }
    @keyframes ${kf}-dot { 0% { transform: translate(-50%, -50%) scale(0) } 60% { transform: translate(-50%, -50%) scale(1.3) } 100% { transform: translate(-50%, -50%) scale(1) } }
    @keyframes ${kf}-fade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes ${kf}-pop { 0% { transform: translateX(-50%) scale(0); opacity: 0 } 70% { transform: translateX(-50%) scale(1.2); opacity: 1 } 100% { transform: translateX(-50%) scale(1); opacity: 1 } }
  `;

  return (
    <div className="flex flex-col h-full justify-center gap-5 px-2">
      {animate && <style>{keyframes}</style>}

      {/* ── Autonomy Spectrum ── */}
      <div>

        <div className="relative px-2">
          {/* "You" label above dot */}
          <div
            className="absolute z-20 flex flex-col items-center"
            style={{
              left: `${effectiveScore}%`,
              transform: 'translateX(-50%)',
              top: '-22px',
              ...(animate ? {
                animation: `${kf}-fade 300ms ease-out both`,
                animationDelay: `${DOT_APPEAR}ms`,
              } : {}),
            }}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600">You</span>
          </div>

          {/* 5-segment health band track */}
          <div className="flex h-4 rounded-full overflow-hidden relative">
            {HEALTH_BANDS.map((band, i) => (
              <div
                key={band.label}
                className="flex-1"
                style={{
                  backgroundColor: band.color,
                  opacity: animate ? 0 : 0.35,
                  transformOrigin: 'left center',
                  ...(animate ? {
                    animation: `${kf}-band 300ms ease-out both`,
                    animationDelay: `${i * BAND_STAGGER}ms`,
                  } : {}),
                }}
              />
            ))}
            {/* You dot — prominent, overlaid on track */}
            <div
              className="absolute top-1/2 z-20 w-6 h-6 rounded-full border-[3px] border-white"
              style={{
                left: `${effectiveScore}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: healthBandColor(effectiveScore),
                boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px ${healthBandColor(effectiveScore)}33`,
                ...(animate ? {
                  animation: `${kf}-dot 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                  animationDelay: `${DOT_APPEAR}ms`,
                } : {}),
              }}
            />
          </div>

          {/* Band labels below track */}
          <div className="flex mt-1.5">
            {HEALTH_BANDS.map((band, i) => (
              <div key={band.label} className="flex-1 text-center">
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide text-stone-500"
                  style={animate ? {
                    animation: `${kf}-fade 300ms ease-out both`,
                    animationDelay: `${i * BAND_STAGGER + 100}ms`,
                  } : undefined}
                >
                  {band.label}
                </span>
              </div>
            ))}
          </div>

          {/* Company dots */}
          <div className="relative h-9 mt-2">
            {companyDots.map((c, i) => (
              <div
                key={c.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${c.score}%`,
                  transform: 'translateX(-50%)',
                  ...(animate ? {
                    animation: `${kf}-pop 350ms ease-out both`,
                    animationDelay: `${COMPANY_START + i * COMPANY_STAGGER}ms`,
                  } : {}),
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
        <p
          className="text-[11px] text-stone-400 text-center mt-2"
          style={animate ? {
            animation: `${kf}-fade 300ms ease-out both`,
            animationDelay: `${METRICS_APPEAR}ms`,
          } : undefined}
        >
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
      <div
        className="flex items-center gap-4 justify-center flex-wrap"
        style={animate ? {
          animation: `${kf}-fade 400ms ease-out both`,
          animationDelay: `${METRICS_APPEAR + 100}ms`,
        } : undefined}
      >
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
