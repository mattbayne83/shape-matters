import { LayerDiagram } from './LayerDiagram';
import { SECTION_LABEL } from '../../lib/styles';

export function GembaComparison() {
  return (
    <>
      <style>{`@keyframes gemba-pulse{0%,100%{opacity:0}40%{opacity:.3}}`}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group bg-stone-50 border border-stone-200 rounded-xl p-4 transition-shadow duration-300 hover:shadow-md">
          <div className={`${SECTION_LABEL} mb-2 text-stone-900`}>
            Without Gemba Walk (9 deep)
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-6 relative overflow-hidden group">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Standard Communication</div>
            <LayerDiagram levels={9} fidelityRate={82} hoverPulse />
          </div>
          <div className="text-center mt-2">
            <span className="text-lg font-bold font-mono tabular-nums text-stone-900">17.4%</span>
            <span className="text-[10px] text-stone-500 ml-1">fidelity at top</span>
          </div>
        </div>
        <div className="group bg-stone-900 border border-stone-700 rounded-xl p-4 transition-shadow duration-300 hover:shadow-lg hover:shadow-stone-900/40">
          <div className={`${SECTION_LABEL} mb-2 text-white`}>
            With Gemba Walk (Direct)
          </div>
          <div className="bg-stone-900 rounded-xl p-6 relative overflow-hidden group shadow-lg">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Gemba Walk</div>
            <LayerDiagram levels={9} fidelityRate={100} inverted hoverPulse />
          </div>
          <div className="text-center mt-2">
            <span className="text-lg font-bold font-mono tabular-nums text-white">100%</span>
            <span className="text-[10px] text-stone-400 ml-1">fidelity at every layer</span>
          </div>
        </div>
      </div>
    </>
  );
}
