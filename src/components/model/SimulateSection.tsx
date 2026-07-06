import { useCompanyStore } from '../../store/useCompanyStore';
import { SECTION_LABEL } from '../../lib/styles';
import { FadeIn } from '../ui/FadeIn';
import { ScenarioPicker } from './ScenarioPicker';
import { RelayCascade } from './RelayCascade';

export function SimulateSection() {
  const levels = useCompanyStore((s) => s.levels);
  const setLevels = useCompanyStore((s) => s.setLevels);

  return (
    <section id="simulate" className="py-16 md:py-24 px-6 md:px-12">
      <FadeIn className="max-w-5xl mx-auto">
        <div className={`${SECTION_LABEL} mb-3`}>Premise 1 · Every Relay Loses Signal</div>
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
          Watch Your Message Decay
        </h2>
        <p className="text-sm text-stone-500 mb-8 max-w-2xl">
          Pick a scenario and watch it pass through each management layer — distorted,
          softened, and reframed at every step. The cards fade as signal decays.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-8 items-start">
          {/* Left column — sticky on desktop */}
          <div className="lg:sticky lg:top-20 space-y-5">
            <ScenarioPicker />

            {/* Levels slider — matches Problem/Model section style */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <label htmlFor="sim-levels" className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    Depth
                  </label>
                  <div className="text-xs text-stone-500 mt-1">Adjust depth of hierarchy</div>
                </div>
                <span className="text-2xl font-black font-sans tabular-nums text-stone-900 bg-white px-3 py-1 rounded-md shadow-sm border border-stone-200">
                  {levels}
                </span>
              </div>
              <input
                id="sim-levels"
                type="range"
                min={2}
                max={12}
                value={levels}
                onChange={(e) => setLevels(Number(e.target.value))}
                aria-valuenow={levels}
                aria-valuemin={2}
                aria-valuemax={12}
                aria-valuetext={`Depth: ${levels}`}
                className="w-full custom-slider focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #E05A1B 0%, #E05A1B ${((levels - 2) / 10) * 100}%, #e7e5e4 ${((levels - 2) / 10) * 100}%, #e7e5e4 100%)`,
                  borderRadius: 2,
                }}
              />
              <style>{`
                #sim-levels::-webkit-slider-thumb { background: #E05A1B; }
                #sim-levels::-moz-range-thumb { background: #E05A1B; }
              `}</style>
              <div className="relative h-3 mt-0.5">
                <span className="absolute left-0 text-[9px] text-stone-400">Flat</span>
                <span className="absolute right-0 text-[9px] text-stone-400">Deep</span>
              </div>
            </div>
          </div>

          {/* Right column — cascade */}
          <div>
            <RelayCascade />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
