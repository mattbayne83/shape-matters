import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const SECTIONS = [
  { id: 'simulate', label: 'Simulate' },
  { id: 'problem', label: 'Problem' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'proof', label: 'Proof' },
  { id: 'objections', label: 'Objections' },
  { id: 'model', label: 'Model' },
  { id: 'methodology', label: 'Methodology' },
];

export function SectionNav() {
  const [active, setActive] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
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
          <div className="relative h-3.5 md:h-4 w-[1.4em] mx-1 group flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full text-stone-900 transition-colors duration-500 group-hover:text-ember"
              viewBox="0 0 100 100"
              fill="currentColor"
              style={{ overflow: 'visible' }}
            >
              {/* Single, elegant triangle that flattens into a line on hover */}
              <polygon
                points="50,10 100,85 0,85"
                className="origin-[50%_85%] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-[0.15]"
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

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-stone-600 hover:text-stone-900 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[49px] right-0 w-64 md:hidden py-2 bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl rounded-bl-xl origin-top-right">
          <div className="flex flex-col">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-6 py-3 text-sm font-semibold text-left transition-colors ${active === s.id
                  ? 'bg-ember/10 text-ember border-l-2 border-ember'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 border-l-2 border-transparent'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
