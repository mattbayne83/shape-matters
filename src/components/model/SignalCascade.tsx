import { useMemo } from 'react';
import { fidelityColor } from '../../lib/fidelityColor';

interface SignalCascadeProps {
  levels: number;
  fidelityRate: number;
  semantic?: boolean;
  /** Use a smaller, more compact layout */
  compact?: boolean;
}

export function SignalCascade({ levels, fidelityRate, semantic, compact }: SignalCascadeProps) {
  const W = 300;
  const PAD = compact ? 20 : 30;
  const usable = W - PAD * 2;
  const centerX = W / 2;

  const data = useMemo(() => {
    const maxBlockH = compact ? 16 : 20;
    const blockH = Math.min(maxBlockH, usable / (levels * 1.5));
    const gap = blockH * 0.35;
    const totalH = levels * blockH + (levels - 1) * gap;
    const topY = PAD + (usable - totalH) / 2;

    return Array.from({ length: levels }, (_, i) => {
      const f = Math.pow(fidelityRate / 100, i) * 100;
      const bw = Math.max(8, (f / 100) * usable);
      const y = topY + i * (blockH + gap);
      return { f, bw, y, blockH };
    });
  }, [levels, fidelityRate, usable, compact, PAD]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-auto">
      <defs>
        <filter id="cascade-glow-f">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {data.map((d, i) => {
        const next = data[i + 1];
        return (
          <g key={i}>
            {next && (
              <path
                d={`M${centerX - d.bw / 2},${d.y + d.blockH}
                    L${centerX + d.bw / 2},${d.y + d.blockH}
                    L${centerX + next.bw / 2},${next.y}
                    L${centerX - next.bw / 2},${next.y} Z`}
                fill={fidelityColor(d.f, semantic)}
                opacity={0.2}
                style={{
                  animation: 'cascade-reveal 0.4s ease-out both',
                  animationDelay: `${i * 80 + 40}ms`,
                  transformOrigin: `${centerX}px ${d.y + d.blockH}px`,
                }}
              />
            )}
            <rect
              x={centerX - d.bw / 2}
              y={d.y}
              width={d.bw}
              height={d.blockH}
              rx={3}
              fill={fidelityColor(d.f, semantic)}
              style={{
                animation: 'cascade-reveal 0.4s ease-out both',
                animationDelay: `${i * 80}ms`,
                transformOrigin: `${centerX}px ${d.y + d.blockH / 2}px`,
              }}
            />
            {!compact && (
              <text
                x={centerX + d.bw / 2 + 8}
                y={d.y + d.blockH / 2 + 4}
                fontSize={9}
                fill="#a8a29e"
                style={{
                  animation: 'cascade-reveal 0.3s ease-out both',
                  animationDelay: `${i * 80 + 200}ms`,
                }}
              >
                {d.f.toFixed(0)}%
              </text>
            )}
          </g>
        );
      })}
      {/* Traveling pulse */}
      {data.length > 1 && (
        <rect
          x={centerX - data[0].bw / 2}
          y={data[0].y}
          width={data[0].bw}
          height={4}
          rx={2}
          fill="white"
          opacity={0.6}
          filter="url(#cascade-glow-f)"
          style={{
            animation: `cascade-pulse ${1.5 + levels * 0.15}s ease-in-out infinite`,
            animationDelay: `${levels * 80 + 400}ms`,
            ['--pulse-start' as string]: `${data[0].y}px`,
            ['--pulse-end' as string]: `${data[data.length - 1].y + data[data.length - 1].blockH}px`,
          }}
        />
      )}
    </svg>
  );
}
