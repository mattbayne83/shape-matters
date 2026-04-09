import { useMemo } from 'react';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { calcAutonomyScore } from '../../lib/autonomy';
import { healthBandColor } from '../../lib/healthScores';

interface AuthoritySpectrumProps {
  dci: number;
  levels: number;
}

export function AuthoritySpectrum({ dci, levels }: AuthoritySpectrumProps) {
  const autonomy = useMemo(() => calcAutonomyScore(dci, levels), [dci, levels]);

  const companyDots = useMemo(
    () =>
      REFERENCE_COMPANIES.filter((c) => c.dci != null).map((c) => ({
        id: c.id,
        name: c.name,
        dci: c.dci!,
        color: c.color,
      })),
    []
  );

  const crossoverDci = autonomy.crossoverFloor;

  return (
    <div className="flex flex-col h-full justify-center gap-6 px-4">
      {/* ── Authority Spectrum Bar (full width hero) ── */}
      <div>
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-5 text-center">
          Authority Spectrum
        </div>

        <div className="relative mx-4">
          {/* Track */}
          <div className="h-4 rounded-full bg-gradient-to-r from-stone-200 via-stone-300 to-stone-400 relative">
            {/* Crossover threshold line */}
            {crossoverDci <= 100 && (
              <div
                className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-stone-500 z-10"
                style={{ left: `${crossoverDci}%` }}
                title={`Crossover: DCI ≥ ${Math.round(crossoverDci)}`}
              />
            )}

            {/* User position indicator */}
            <div
              className="absolute top-1/2 w-5 h-5 rounded-full border-[2.5px] border-white shadow-lg z-20 transition-all duration-300"
              style={{
                left: `${dci}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: healthBandColor(autonomy.score),
              }}
            />
          </div>

          {/* Company dots */}
          <div className="relative h-10 mt-2">
            {companyDots.map((c) => (
              <div
                key={c.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${c.dci}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border border-white/80 shadow-sm"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-[9px] text-stone-400 whitespace-nowrap mt-1">
                  {c.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Axis labels */}
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-stone-400">CEO-centric (0)</span>
            <span className="text-[9px] text-stone-400">IC-empowered (100)</span>
          </div>
        </div>

        {/* Crossover annotation */}
        {crossoverDci <= 100 && (
          <p className="text-[11px] text-stone-400 text-center mt-3">
            At your depth, DCI above{' '}
            <span className="font-bold text-stone-600">{Math.round(crossoverDci)}</span>{' '}
            beats structurally flatter competitors
          </p>
        )}
      </div>

      {/* ── Depth Leverage (compact inline row) ── */}
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <div className="bg-stone-50 rounded-lg px-4 py-2 text-center shrink-0">
          <div className="text-[9px] text-stone-400 uppercase font-semibold tracking-wide mb-0.5">
            Structural discount
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-stone-900">
            ×{autonomy.depthDiscount.toFixed(2)}
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

        {autonomy.score < 50 && (
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
