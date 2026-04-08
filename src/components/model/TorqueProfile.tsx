interface TorqueProfileProps {
  levels: number;
  torqueProfile: number[];
  agilityScore: number;
}

/** Horizontal bar chart showing pivot efficiency by origin layer. */
export function TorqueProfile({ levels, torqueProfile, agilityScore }: TorqueProfileProps) {
  const maxVal = Math.max(...torqueProfile, 0.01);

  // Build labels: CEO at top (last index), ICs at bottom (index 0)
  const rows = torqueProfile
    .map((efficiency, i) => ({
      label: i === levels - 1 ? 'CEO' : i === 0 ? 'ICs' : `L${i}`,
      efficiency,
      isCeo: i === levels - 1,
    }))
    .reverse(); // CEO first

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-3 text-center shrink-0">
        Pivot Efficiency by Origin
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-1.5">
        {rows.map((row) => {
          const pct = (row.efficiency / maxVal) * 100;
          return (
            <div key={row.label} className="flex items-center gap-2">
              <span className={`text-[11px] font-mono w-6 text-right shrink-0 ${row.isCeo ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                {row.label}
              </span>
              <div className="flex-1 h-4 bg-stone-100 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: row.isCeo ? '#E05A1B' : '#a8967a',
                  }}
                />
              </div>
              <span className={`text-[11px] font-mono tabular-nums w-10 text-right shrink-0 ${row.isCeo ? 'font-bold text-stone-900' : 'text-stone-500'}`}>
                {(row.efficiency * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-stone-400 text-center mt-3 shrink-0">
        CEO pivot efficiency: <span className="font-bold text-stone-700">{(agilityScore * 100).toFixed(1)}%</span>
        {' · '}
        {agilityScore > 0.7
          ? 'Strong reach — directives land'
          : agilityScore > 0.4
            ? 'Moderate — signal fades before the front line'
            : 'Weak — most of the org never gets the message'}
      </p>
    </div>
  );
}
