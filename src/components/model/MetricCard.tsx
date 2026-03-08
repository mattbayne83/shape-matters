import { SECTION_LABEL } from '../../lib/styles';

function scrollToAnchor(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (!href) return;
  const target = document.querySelector(href);
  if (!target) return;
  const details = target.closest('details');
  if (details && !details.open) details.open = true;
  setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: string;
  infoHref?: string;
}

export function MetricCard({ label, value, unit, sub, accent, infoHref }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 min-w-0">
      <div className={`${SECTION_LABEL} mb-1.5 flex items-center gap-1`}>
        {label}
        {infoHref && (
          <a
            href={infoHref}
            onClick={scrollToAnchor}
            className="text-slate-300 hover:text-slate-500 transition-colors"
            title="View formula"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2.5a1 1 0 110 2 1 1 0 010-2zM6.5 7h2v4.5h-2V7z" />
            </svg>
          </a>
        )}
      </div>
      <div className="text-2xl font-extrabold leading-none font-mono" style={{ color: accent || '#0f172a' }}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-[11px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
