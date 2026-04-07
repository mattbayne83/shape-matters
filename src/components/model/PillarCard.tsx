import { ChevronDown, ChevronUp } from 'lucide-react';

export type PillarId = 'fidelity' | 'lag' | 'response';

interface PillarCardProps {
  id: PillarId;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  healthColor?: string;
  isExpanded: boolean;
  hasExpandedSibling?: boolean;
  onToggle: () => void;
}

export function PillarCard({
  label,
  value,
  sub,
  accentColor,
  healthColor,
  isExpanded,
  hasExpandedSibling,
  onToggle,
}: PillarCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-full text-left bg-white rounded-xl border p-5
        transition-all duration-300 cursor-pointer overflow-hidden
        ${isExpanded
          ? 'border-stone-300 ring-2 shadow-md z-10 scale-[1.02] bg-stone-50/50'
          : hasExpandedSibling
            ? 'border-stone-100 opacity-60 scale-95 hover:opacity-85 shadow-none hover:scale-[0.97]'
            : 'border-stone-200 hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 shadow-sm'}
      `}
      style={isExpanded ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}}
    >
      {/* Active Tab Indicator Line */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`} 
        style={{ backgroundColor: accentColor }} 
      />
      
      <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 transition-colors">
        {label}
      </p>
      <p
        className={`text-3xl font-bold font-mono tabular-nums mb-1 transition-colors`}
        style={{ color: healthColor ?? accentColor }}
      >
        {value}
      </p>
      <p className="text-sm text-stone-500">{sub}</p>
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium transition-colors ${isExpanded ? 'text-stone-600' : 'text-stone-400'}`}>
        {isExpanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            Collapse
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            Explore
          </>
        )}
      </div>
    </button>
  );
}
