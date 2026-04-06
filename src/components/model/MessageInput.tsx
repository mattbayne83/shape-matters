import { useCompanyStore } from '../../store/useCompanyStore';

export function MessageInput() {
  const customMessage = useCompanyStore((s) => s.customMessage);
  const setCustomMessage = useCompanyStore((s) => s.setCustomMessage);
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const setActiveScenarioId = useCompanyStore((s) => s.setActiveScenarioId);

  function handleChange(value: string) {
    if (activeScenarioId) {
      setActiveScenarioId(null);
    }
    setCustomMessage(value);
  }

  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
        {activeScenarioId ? 'Scenario message' : 'Or type your own'}
      </div>
      <textarea
        value={customMessage}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type a message that someone at the bottom of your org would send up the chain..."
        rows={5}
        className="w-full text-sm text-stone-800 bg-white border border-stone-200 rounded-lg p-3 resize-none placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember/40"
      />
      {!activeScenarioId && customMessage.trim() && (
        <p className="text-[10px] text-stone-400 italic">
          Custom messages use simplified transformation rules
        </p>
      )}
    </div>
  );
}
