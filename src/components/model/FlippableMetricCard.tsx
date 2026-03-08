function scrollToAnchor(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    e.stopPropagation();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    const target = document.querySelector(href);
    if (!target) return;
    const details = target.closest('details');
    if (details && !details.open) details.open = true;
    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

interface FlippableMetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    sub?: string;
    color?: string;
    infoHref?: string;
    // Range props
    minOut: number;
    maxOut: number;
    currentOut: number;
    inverseBest?: boolean;
    bestLabel?: string;
    worstLabel?: string;
}

export function FlippableMetricCard({
    label,
    value,
    unit,
    sub,
    color = '#1C1917',
    infoHref,
    minOut,
    maxOut,
    currentOut,
    inverseBest = false,
    bestLabel = 'Best',
    worstLabel = 'Worst',
}: FlippableMetricCardProps) {
    // Map currentOut to the physical left-to-right axis.
    // Left = Best, Right = Worst.
    let markerLeftPct = 0;
    if (inverseBest) {
        // Lower = Better = Left side
        markerLeftPct = ((currentOut - minOut) / (maxOut - minOut)) * 100;
    } else {
        // Higher = Better = Left side
        markerLeftPct = 100 - (((currentOut - minOut) / (maxOut - minOut)) * 100);
    }
    markerLeftPct = Math.max(0, Math.min(100, markerLeftPct));

    return (
        <div className="bg-white border border-stone-200 rounded-xl flex flex-col items-center justify-center px-4 pt-4 pb-3 shadow-sm">
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                {label}
                {infoHref && (
                    <a
                        href={infoHref}
                        onClick={scrollToAnchor}
                        className="text-stone-300 hover:text-stone-500 transition-colors"
                        title="View formula"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2.5a1 1 0 110 2 1 1 0 010-2zM6.5 7h2v4.5h-2V7z" />
                        </svg>
                    </a>
                )}
            </div>
            <div
                className="text-2xl md:text-3xl font-bold font-sans tabular-nums tracking-tight leading-none transition-colors duration-300"
                style={{ color }}
            >
                {value}
                {unit && <span className="text-sm font-normal text-stone-400 ml-0.5">{unit}</span>}
            </div>
            {sub && <div className="text-[10px] text-stone-400 mt-1.5">{sub}</div>}

            {/* Outcome range bar */}
            <div className="w-full mt-3 pt-2 border-t border-stone-100">
                <div
                    className="relative w-full h-1.5 rounded-full"
                    style={{ background: 'linear-gradient(to right, #16a34a, #fbbf24, #ef4444)' }}
                >
                    <div
                        className="absolute top-[-7px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent transition-all duration-300"
                        style={{
                            left: `calc(${markerLeftPct}% - 5px)`,
                            borderTopColor: '#1C1917',
                        }}
                    />
                </div>
                <div className="flex justify-between text-[9px] font-medium text-stone-400 mt-0.5">
                    <span className="text-green-600">{bestLabel}</span>
                    <span className="text-red-600">{worstLabel}</span>
                </div>
            </div>
        </div>
    );
}
