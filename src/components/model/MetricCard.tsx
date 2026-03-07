import { SECTION_LABEL } from '../../lib/styles';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: string;
}

export function MetricCard({ label, value, unit, sub, accent }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 min-w-0">
      <div className={`${SECTION_LABEL} mb-1.5`}>{label}</div>
      <div className="text-2xl font-extrabold leading-none font-mono" style={{ color: accent || '#0f172a' }}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-[11px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
