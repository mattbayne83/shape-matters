import { scrollToAnchor } from '../../lib/scrollToAnchor';

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
        <div className="bg-white border border-stone-200 rounded-xl flex flex-col items-center justify-center px-4 py-3 shadow-sm min-h-[110px]">
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
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
            {sub && <div className="text-[9px] text-stone-400 mt-1">{sub}</div>}

            {/* Outcome range bar */}
            <div className="w-full mt-2 pt-1.5 border-t border-stone-100">
                <div
                    className="relative w-full h-1.5 rounded-full"
                    style={{ background: 'linear-gradient(to right, #57534e, #a8a29e, #E05A1B)' }}
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
                    <span className="text-stone-600">{bestLabel}</span>
                    <span className="text-ember">{worstLabel}</span>
                </div>
            </div>
        </div>
    );
}
