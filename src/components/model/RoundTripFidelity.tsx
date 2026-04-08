import { useMemo } from 'react';
import { fidelityColor } from '../../lib/fidelityColor';

interface RoundTripFidelityProps {
  levels: number;
  fidelityRate: number;
}

export function RoundTripFidelity({ levels, fidelityRate }: RoundTripFidelityProps) {
  const relays = levels - 1;
  const r = fidelityRate / 100;

  const oneWay = useMemo(() => Math.pow(r, relays) * 100, [r, relays]);
  const roundTrip = useMemo(() => Math.pow(r, relays * 2) * 100, [r, relays]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-2">
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide shrink-0">
        Round-Trip Fidelity
      </div>

      <div className="text-center">
        <span
          className="text-5xl font-extrabold font-mono tabular-nums leading-none"
          style={{ color: fidelityColor(roundTrip, true) }}
        >
          {roundTrip.toFixed(1)}%
        </span>
        <p className="text-xs text-stone-400 mt-2">of the original signal survives the round trip</p>
      </div>

      <div className="flex gap-3 w-full max-w-[280px]">
        <div className="flex-1 text-center bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5">
          <div className="text-[8px] font-bold text-stone-400 uppercase tracking-wide">One-Way</div>
          <div
            className="text-xl font-extrabold font-mono tabular-nums mt-0.5"
            style={{ color: fidelityColor(oneWay, true) }}
          >
            {oneWay.toFixed(1)}%
          </div>
          <div className="text-[9px] text-stone-400">{relays} relays</div>
        </div>
        <div className="flex-1 text-center bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5">
          <div className="text-[8px] font-bold text-stone-400 uppercase tracking-wide">Round-Trip</div>
          <div
            className="text-xl font-extrabold font-mono tabular-nums mt-0.5"
            style={{ color: fidelityColor(roundTrip, true) }}
          >
            {roundTrip.toFixed(1)}%
          </div>
          <div className="text-[9px] text-stone-400">{relays * 2} relays</div>
        </div>
      </div>
    </div>
  );
}
