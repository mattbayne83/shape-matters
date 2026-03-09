import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'problem', label: 'Problem' },
  { id: 'proof', label: 'Proof' },
  { id: 'shape', label: 'Shape' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'model', label: 'Model' },
  { id: 'methodology', label: 'Methodology' },
];

export function SectionNav() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-12">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <span className="text-sm font-black font-serif text-stone-900 tracking-tight">shape</span>
          <div className="relative h-4 md:h-5 w-[1.2em] group flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full text-stone-900 transition-transform duration-500 ease-out group-hover:scale-105"
              viewBox="0 0 120 100"
              fill="none"
              style={{ overflow: 'visible' }}
            >
              {/* 
                Perfect geometric alignments.
                Slope of the triangles and the center line all mathematically equal to exactly -2.666 (dx=30, dy=80 and dx=15, dy=40).
              */}
              {/* Left downward-pointing triangle */}
              <polygon
                points="20,10 50,10 35,50"
                fill="currentColor"
                className="origin-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-x-1 hover:fill-ember cursor-pointer"
              />

              {/* Center slicing diagonal line */}
              <line
                x1="45" y1="90"
                x2="75" y2="10"
                stroke="currentColor"
                strokeWidth="7"
                className="origin-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-y-110 group-hover:stroke-stone-900"
              />

              {/* Right upward-pointing triangle */}
              <polygon
                points="85,30 100,70 70,70"
                fill="currentColor"
                className="origin-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1 group-hover:translate-y-1 hover:fill-ember cursor-pointer"
              />
            </svg>
          </div>
          <span className="text-sm font-black font-serif text-stone-900 tracking-tight">matters</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${active === s.id
                ? 'bg-ember text-white'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
