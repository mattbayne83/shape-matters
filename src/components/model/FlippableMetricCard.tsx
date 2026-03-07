interface FlippableMetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    sub?: string;
    color?: string;
    // Range props for the back
    minOut: number;
    maxOut: number;
    currentOut: number;
    inverseBest?: boolean; // If true, lower is better (left side of gradient is good)
    bestLabel?: string;
    worstLabel?: string;
}

export function FlippableMetricCard({
    label,
    value,
    unit,
    sub,
    color = '#0f172a',
    minOut,
    maxOut,
    currentOut,
    inverseBest = false,
    bestLabel = 'Best',
    worstLabel = 'Worst',
}: FlippableMetricCardProps) {
    // Calculate percentage placement of the triangle
    // Clamp between 0 and 100
    let rangePct = ((currentOut - minOut) / (maxOut - minOut)) * 100;
    if (rangePct < 0) rangePct = 0;
    if (rangePct > 100) rangePct = 100;


    // The prompt requested: "show a range of outcomes (best on left, worst on right)"
    // So best is ALWAYS on the left.
    const gradientToUse = 'linear-gradient(to right, #16a34a, #fbbf24, #ef4444)';

    // We need to map the currentOut to the physical left-to-right axis.
    // Physical Left = Best. Physical Right = Worst.

    // If `inverseBest` is true, a LOWER number means BETTER. So lower number goes on the left (0%).
    // If `inverseBest` is false, a HIGHER number means BETTER. So higher number goes on the left (0%).

    let markerLeftPct = 0;
    if (inverseBest) {
        // Lower = Better = Left side
        markerLeftPct = ((currentOut - minOut) / (maxOut - minOut)) * 100;
    } else {
        // Higher = Better = Left side
        // Reverse the percentage so maxOut is at 0% and minOut is at 100%
        markerLeftPct = 100 - (((currentOut - minOut) / (maxOut - minOut)) * 100);
    }

    // Clamp marker
    markerLeftPct = Math.max(0, Math.min(100, markerLeftPct));

    return (
        <div className="relative w-full h-32 perspective-[1000px] z-10 hover:z-20">
            <div className="relative group w-full h-full transition-transform duration-500 preserve-3d">

                {/* FRONT FACE */}
                <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 shadow-sm group-hover:-rotate-y-180 transition-transform duration-500 preserve-3d">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        {label}
                    </div>
                    <div
                        className="text-2xl md:text-3xl font-bold font-sans tabular-nums tracking-tight leading-none transition-colors duration-300"
                        style={{ color: color }}
                    >
                        {value}
                        {unit && <span className="text-sm font-normal text-slate-400 ml-0.5">{unit}</span>}
                    </div>
                    {sub && <div className="text-[10px] text-slate-400 mt-1.5">{sub}</div>}
                </div>

                {/* BACK FACE */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-center px-4 py-3 shadow-md group-hover:rotate-y-0 transition-transform duration-500 preserve-3d">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-3 text-center">
                        {label} Outcome Range
                    </div>

                    <div className="relative w-full h-2 rounded-full mb-1" style={{ background: gradientToUse }}>
                        <div
                            className="absolute top-[-10px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent transition-all duration-300"
                            style={{
                                left: `calc(${markerLeftPct}% - 6px)`,
                                borderTopColor: '#0f172a'
                            }}
                        />
                    </div>

                    <div className="flex justify-between text-[9px] font-medium text-slate-400">
                        <span className="text-green-600">{bestLabel}</span>
                        <span className="text-red-600">{worstLabel}</span>
                    </div>

                </div>

            </div>
        </div>
    );
}
