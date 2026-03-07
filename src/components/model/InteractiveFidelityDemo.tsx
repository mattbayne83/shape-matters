import { useState } from 'react';
import { LayerDiagram } from './LayerDiagram';
import { fidelityColor } from '../../lib/fidelityColor';
import { SECTION_LABEL } from '../../lib/styles';

export function InteractiveFidelityDemo() {
  const [rate, setRate] = useState(82);
  const [levels, setLevels] = useState(6);
  const fidelityNum = Math.pow(rate / 100, levels - 1) * 100;
  const fidelity = fidelityNum.toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className={`${SECTION_LABEL} mb-4`}>
        Interactive: Signal Degradation
      </div>
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <label htmlFor="demo-fidelity" className="text-[11px] text-slate-500 block mb-3">
            Per-layer fidelity: <span className="font-mono font-bold text-slate-900 text-sm ml-1">{rate}%</span>
          </label>
          <input
            id="demo-fidelity"
            type="range"
            min={50}
            max={98}
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95 [&::-webkit-slider-thumb]:transition-transform"
          />
        </div>
        <div>
          <label htmlFor="demo-levels" className="text-[11px] text-slate-500 block mb-3">
            Levels: <span className="font-mono font-bold text-sm ml-1" style={{ color: '#9B4D42' }}>{levels}</span>
          </label>
          <input
            id="demo-levels"
            type="range"
            min={2}
            max={15}
            value={levels}
            onChange={(e) => setLevels(+e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95 [&::-webkit-slider-thumb]:transition-transform"
            style={
              {
                '--thumb-color': '#9B4D42',
              } as React.CSSProperties
            }
          />
          {/* Inject style for the thumb color so it's dynamic */}
          <style>{`
            #demo-levels::-webkit-slider-thumb {
              background-color: var(--thumb-color);
            }
          `}</style>
        </div>
      </div>
      <div className="text-center mb-4">
        <div
          className="text-3xl font-black font-mono"
          style={{ color: fidelityColor(fidelityNum) }}
        >
          {fidelity}%
        </div>
        <div className="text-[11px] text-slate-500">signal reaching the top after {levels - 1} relays</div>
      </div>
      <LayerDiagram levels={levels} fidelityRate={rate} />
    </div>
  );
}
