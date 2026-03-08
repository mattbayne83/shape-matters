import { LayerDiagram } from './LayerDiagram';
import { SECTION_LABEL } from '../../lib/styles';

export function GembaComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <div className={`${SECTION_LABEL} mb-2 text-stone-900`}>
          Without Gemba Walk (9 levels)
        </div>
        <div className="text-sm text-stone-600 mb-3">
          Signal passes through 8 relays before reaching the CEO.
        </div>
        <LayerDiagram levels={9} fidelityRate={82} />
        <div className="text-center mt-2">
          <span className="text-lg font-black font-mono text-stone-900">17.4%</span>
          <span className="text-[10px] text-stone-500 ml-1">fidelity at top</span>
        </div>
      </div>
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <div className={`${SECTION_LABEL} mb-2 text-stone-900`}>
          With Gemba Walk (Direct)
        </div>
        <div className="text-sm text-stone-600 mb-3">
          Leader observes directly. Zero relays. Full fidelity.
        </div>
        <LayerDiagram levels={2} fidelityRate={100} />
        <div className="text-center mt-2">
          <span className="text-lg font-black font-mono text-stone-900">100%</span>
          <span className="text-[10px] text-stone-500 ml-1">fidelity (direct observation)</span>
        </div>
      </div>
    </div>
  );
}
