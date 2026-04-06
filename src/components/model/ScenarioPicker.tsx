import { useCompanyStore } from '../../store/useCompanyStore';
import { SCENARIOS } from '../../data/scenarios';
import type { ScenarioCategory } from '../../types';

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  safety: 'Safety',
  strategy: 'Strategy',
  customer: 'Customer',
  innovation: 'Innovation',
  operations: 'Operations',
};

const CATEGORIES: ScenarioCategory[] = ['safety', 'customer', 'innovation', 'strategy', 'operations'];

export function ScenarioPicker() {
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const setActiveScenarioId = useCompanyStore((s) => s.setActiveScenarioId);

  function handleSelect(id: string) {
    setActiveScenarioId(activeScenarioId === id ? null : id);
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
        Choose a scenario
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const scenario = SCENARIOS.find((s) => s.category === cat)!;
          const isActive = activeScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'bg-ember text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>
      {activeScenarioId && (
        <div className="text-xs text-stone-500 mt-1">
          {SCENARIOS.find((s) => s.id === activeScenarioId)?.title}
        </div>
      )}
    </div>
  );
}
