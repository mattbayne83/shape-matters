import type { MetricDefinition } from '../../data/methodologyMetrics';

const BADGE_STYLES: Record<MetricDefinition['category'], { stripe: string; badge: string; label: string }> = {
  fidelity: { stripe: 'bg-ember', badge: 'bg-ember/10 text-ember', label: 'Fidelity' },
  latency: { stripe: 'bg-warm-stone', badge: 'bg-warm-stone/10 text-warm-stone', label: 'Latency' },
  autonomy: { stripe: 'bg-warm-stone', badge: 'bg-warm-stone/10 text-warm-stone', label: 'Autonomy' },
  supplementary: { stripe: 'bg-stone-400', badge: 'bg-stone-100 text-stone-400', label: 'Supplementary' },
};

export function MethodologyCard({ id, title, formula, description, constants, category }: MetricDefinition) {
  const style = BADGE_STYLES[category];

  return (
    <div
      id={id}
      className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden scroll-mt-24 flex flex-col hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Category stripe */}
      <div className={`h-1 ${style.stripe}`} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header row: title + badge */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-serif font-bold text-lg text-stone-900 leading-tight">
            {title}
          </h4>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${style.badge}`}
          >
            {style.label}
          </span>
        </div>

        {/* Formula block */}
        <div className="bg-stone-50 rounded-lg px-3 py-2.5 mb-1">
          <div className="font-mono text-sm text-stone-800">{formula}</div>
          {constants && (
            <div className="text-[11px] text-stone-400 mt-1">{constants}</div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-stone-500 leading-relaxed mt-2 flex-1">
          {description}
        </p>
      </div>
    </div>
  );
}
