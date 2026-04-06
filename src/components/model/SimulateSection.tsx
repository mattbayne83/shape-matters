import { useCompanyStore } from '../../store/useCompanyStore';
import { SECTION_LABEL } from '../../lib/styles';
import { FadeIn } from '../ui/FadeIn';
import { ScenarioPicker } from './ScenarioPicker';
import { MessageInput } from './MessageInput';
import { RelayCascade } from './RelayCascade';

export function SimulateSection() {
  const levels = useCompanyStore((s) => s.levels);
  const setLevels = useCompanyStore((s) => s.setLevels);

  return (
    <section id="simulate" className="py-16 md:py-24 px-6 md:px-12">
      <FadeIn className="max-w-5xl mx-auto">
        <div className={`${SECTION_LABEL} mb-3`}>The Telephone Effect</div>
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
          Watch Your Message Decay
        </h2>
        <p className="text-sm text-stone-500 mb-8 max-w-2xl">
          Pick a scenario or type your own message. Then watch it pass through each management
          layer — distorted, softened, and reframed at every step.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-8 items-start">
          {/* Left column — sticky on desktop */}
          <div className="lg:sticky lg:top-20 space-y-5">
            <ScenarioPicker />
            <MessageInput />

            {/* Levels slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Org Levels
                </div>
                <span className="text-sm font-bold font-mono text-stone-800">{levels}</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                value={levels}
                onChange={(e) => setLevels(Number(e.target.value))}
                className="w-full accent-ember"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>2 (flat)</span>
                <span>12 (deep)</span>
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
