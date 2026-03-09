import type { MetricDefinition } from '../../data/methodologyMetrics';

export function MethodologyCard({ id, title, formula, description, constants, category }: MetricDefinition) {
  const isPrimary = category === 'primary';

  return (
    <div
      id={id}
      className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden scroll-mt-24 flex flex-col"
    >
      {/* Category stripe */}
      <div className={`h-1 ${isPrimary ? 'bg-ember' : 'bg-warm-stone'}`} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header row: title + badge */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-serif font-bold text-lg text-stone-900 leading-tight">
            {title}
          </h4>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
              isPrimary
                ? 'bg-ember/10 text-ember'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            {isPrimary ? 'Primary' : 'Secondary'}
          </span>
        </div>

        {/* Formula block */}
        <div className="bg-stone-50 rounded-lg px-3 py-2.5 mb-1">
          <div className="font-mono text-sm text-stone-800">{formula}</div>
          {constants && (
            <div className="text-[11px] text-stone-400 mt-1">{constants}</div>
          )}
        </div>

        {/* Description / "flavor text" */}
        <p className="text-sm text-stone-500 leading-relaxed mt-2 flex-1">
          {description}
        </p>
      </div>
    </div>
  );
}
