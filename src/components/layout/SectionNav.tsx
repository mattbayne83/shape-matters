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
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-12">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <span className="text-sm font-black text-slate-900 tracking-tight">shape</span>
          <svg className="h-4 md:h-5 w-auto" viewBox="0 0 120 100" fill="none">
            {/* Left downward-pointing triangle */}
            <polygon points="16.2,25 53.8,25 35,75" fill="black" />

            {/* Center slicing diagonal line */}
            <line x1="45" y1="90" x2="75" y2="10" stroke="black" strokeWidth="8" />

            {/* Right upward-pointing triangle */}
            <polygon points="85,25 103.8,75 66.2,75" fill="black" />
          </svg>
          <span className="text-sm font-black text-slate-900 tracking-tight">matters</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${active === s.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
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
