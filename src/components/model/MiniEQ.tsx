// VU meter color ramp — bottom (low) to top (high), 5 segments
const SEG_COLORS = [
  '#44403c', // 0-20   stone-700
  '#57534e', // 20-40  stone-600
  '#A8967A', // 40-60  warm-stone
  '#F4A261', // 60-80  ember-light
  '#E05A1B', // 80-100 ember
];

interface MiniEQProps {
  score: number;
}

const SEGMENTS = 5;

export function MiniEQ({ score }: MiniEQProps) {
  const filledCount = Math.round(Math.min(Math.max(score, 0), 100) / (100 / SEGMENTS));

  return (
    <div className="flex flex-col-reverse gap-[1.5px]" style={{ height: 32, width: 10 }}>
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const isFilled = i < filledCount;
        const isTop = i === filledCount - 1 && filledCount > 0;
        const color = SEG_COLORS[Math.min(i, SEG_COLORS.length - 1)];

        return (
          <div
            key={i}
            className="w-full flex-1 rounded-[1.5px]"
            style={{
              backgroundColor: isFilled ? color : '#e7e5e4',
              opacity: isFilled ? 1 : 0.4,
              boxShadow: isTop ? `0 0 6px ${color}88` : 'none',
              transition: 'background-color 300ms ease-out, opacity 300ms ease-out',
            }}
          />
        );
      })}
    </div>
  );
}
