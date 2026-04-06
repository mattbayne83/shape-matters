import { useEffect, useState } from 'react';
import { Github, MessageCircle } from 'lucide-react';
import { InteractiveFidelityDemo } from '../components/model/InteractiveFidelityDemo';
import { GembaComparison } from '../components/model/GembaComparison';
import { ComparisonView } from '../components/model/ComparisonView';
import { ModelYourOrg } from '../components/model/ModelYourOrg';
import { MethodologySection } from '../components/model/MethodologySection';
import { HeroSection } from '../components/model/HeroSection';
import { SimulateSection } from '../components/model/SimulateSection';
import { SECTION_LABEL } from '../lib/styles';
import { FadeIn } from '../components/ui/FadeIn';

export function ScrollPage() {
  // Footer visibility state (starts visible, hides after scroll/delay, shows at bottom)
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [isFooterFixed, setIsFooterFixed] = useState(true);

  // Browser processes hash before React renders the DOM, so the scroll
  // target doesn't exist yet. Re-apply after mount + persist hydration.
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Footer hide/show behavior
  useEffect(() => {
    // Hide fixed footer after 3 seconds on initial load
    const hideTimer = setTimeout(() => {
      if (window.scrollY < 100) {
        setIsFooterVisible(false);
      }
    }, 3000);

    const handleScroll = () => {
      clearTimeout(hideTimer);

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - (scrollY + windowHeight);

      // Show footer (static position) when within 200px of bottom
      if (distanceFromBottom < 200) {
        setIsFooterFixed(false);
        setIsFooterVisible(true);
      }
      // Hide footer when scrolling down past 100px
      else if (scrollY > 100) {
        setIsFooterFixed(false);
        setIsFooterVisible(false);
      }
      // Show fixed footer when at top
      else {
        setIsFooterFixed(true);
        setIsFooterVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO ─── */}
      <HeroSection />

      {/* ─── THE PROBLEM (merged Problem + Math) ─── */}
      <section id="problem" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Problem</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-6">
            Relays Destroy Signal
          </h2>
          <div className="text-sm text-stone-700 leading-relaxed space-y-4 mb-8">
            <p>
              In 1932, Frederic Bartlett published <em>Remembering</em>, a landmark study that
              revealed how information degrades when passed sequentially between people. He asked
              participants to read a short story — <em>The War of the Ghosts</em> — and reproduce it
              from memory. The reproduced version was then passed to another participant, who read
              and reproduced it in turn. This continued through a chain of 6-10 participants.
            </p>
            <p>
              The results were striking: content shrank 40-50% by the 4th participant. Unfamiliar
              elements were replaced — canoes became boats, hunting seals became fishing. But the
              most important finding was the <em>contrast</em>: when the same person retold the story
              over weeks, it stabilized. It was the <strong>handoff between people</strong> — the
              relay — that destroyed signal.
            </p>
            <p>
              If each management layer retains roughly 80-85% of the information it receives, we
              can model cumulative fidelity loss mathematically. At 82% per-layer retention, a
              9-level organization retains only <strong>17% of the original signal</strong> by the
              time information reaches the CEO. Leaders in deep hierarchies are making strategic
              decisions based on <em>systematically degraded</em> information.
            </p>
          </div>

          <InteractiveFidelityDemo />
        </FadeIn>
      </section>

      {/* ─── THE TELEPHONE EFFECT ─── */}
      <SimulateSection />

      {/* ─── THE PROOF (Company data — moved up from section 6) ─── */}
      <section id="proof" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Proof</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            Real Companies, Real Structures
          </h2>
          <p className="text-sm text-stone-500 mb-8 max-w-2xl">
            Here's what compound signal decay looks like across 6 real companies — from Valve's
            zero-relay flat structure to Amazon's 9-level hierarchy.
          </p>
          <ComparisonView />
        </FadeIn>
      </section>

      {/* ─── THE EVIDENCE ─── */}
      <section id="evidence" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Evidence</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-6">
            Three Disciplines, One Conclusion
          </h2>

          <div className="text-sm text-stone-700 leading-relaxed space-y-4 mb-8">
            <p>
              Toyota's leaders understood — decades before organizational theory formalized it —
              that reports traveling up a hierarchy cannot substitute for direct observation. The
              Gemba Walk is, in engineering terms, a{' '}
              <strong>bypass circuit around the lossy relay chain</strong>. Instead of waiting for
              information to percolate up through layers of management, leaders physically go to
              where value is created and observe directly.
            </p>
            <p>
              <strong>The meta-insight:</strong> if hierarchical communication were lossless, the
              Gemba Walk would be unnecessary. Its very existence is an admission that tall
              structures degrade information.
            </p>
          </div>

          <div className="mb-8">
            <GembaComparison />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <div className="text-sm font-extrabold text-stone-900 mb-1">
              Deming's Quality Framework & the Gemba Walk
            </div>
            <div className="text-[11px] text-stone-500 mb-4">
              Supporting evidence from W. Edwards Deming (1982) and the Toyota Production System
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-white rounded-lg p-3.5 border border-stone-200">
                <div className="text-[11px] font-bold text-stone-900 uppercase mb-2.5">
                  Deming's Points That Map to Shape Theory
                </div>
                <div className="text-xs text-stone-700 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-stone-900 font-bold">Point 8:</span>{' '}
                    <strong>Drive out fear</strong> — Fear increases at each hierarchical layer.
                    Subordinates filter information upward to avoid blame.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Point 9:</span>{' '}
                    <strong>Break down barriers</strong> — Hierarchical silos force lateral
                    communication to route vertically, multiplying relay hops.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Point 11:</span>{' '}
                    <strong>Eliminate management by numbers</strong> — Aggregated KPIs climbing a
                    tall hierarchy are lossy summaries.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Point 12:</span>{' '}
                    <strong>Remove barriers to pride</strong> — Deep hierarchies distance
                    decision-makers from the people who understand the work.
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3.5 border border-stone-200">
                <div className="text-[11px] font-bold text-stone-900 uppercase mb-2.5">
                  The Gemba Walk as Bypass Circuit
                </div>
                <div className="text-xs text-stone-700 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-stone-900 font-bold">Go See</span> — Direct observation
                    bypasses every relay. Fidelity = 100%.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Ask Why</span> — First-person
                    inquiry avoids the editorial filtering each layer adds.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Show Respect</span> — Eliminates
                    fear (Deming Point 8) that causes subordinates to distort upward communication.
                  </div>
                  <div className="mt-2.5 p-2 bg-stone-100 rounded text-[11px] text-stone-700">
                    <strong className="text-stone-900">Key insight:</strong> In a flat org, the
                    Gemba Walk is short or unnecessary — leadership is already close to the work.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3.5 border border-stone-200">
              <div className="text-[11px] font-bold text-stone-900 uppercase mb-2.5">
                Unified Model — Bartlett + Deming + Shape Theory
              </div>
              <div className="font-mono text-xs text-stone-800 leading-loose space-y-0.5">
                <div>
                  <span className="text-stone-400">Bartlett (1932): </span>Information degrades per
                  serial relay →{' '}
                  <span className="text-stone-900 font-bold">fidelity loss is structural</span>
                </div>
                <div>
                  <span className="text-stone-400">Deming (1982):{'  '}</span>Every layer adds
                  variation + fear →{' '}
                  <span className="text-stone-900 font-bold">quality degrades with hierarchy depth</span>
                </div>
                <div>
                  <span className="text-stone-400">Toyota (1950s): </span>Gemba Walk invented to
                  bypass hierarchy →{' '}
                  <span className="text-stone-900 font-bold">hierarchy acknowledged as problem</span>
                </div>
                <div>
                  <span className="text-stone-400">Shape Theory:{'   '}</span>Flatness Index
                  predicts fidelity + productivity →{' '}
                  <span className="text-stone-900 font-bold">testable hypothesis</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── MODEL YOUR ORG (merged Calculator + Depth Tax) ─── */}
      <section id="model" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Model Your Org</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            See Your Organization's Shape
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            Adjust levels, headcount, and fidelity rate to see how depth affects signal quality,
            decision speed, and organizational agility.
          </p>
          <ModelYourOrg />
        </FadeIn>
      </section>

      {/* ─── METHODOLOGY ─── */}
      <section id="methodology" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Methodology</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            How We Calculate
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            Data sources, formula derivations, assumptions, and limitations
          </p>
          <MethodologySection />
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className={`border-t border-stone-200 py-4 px-6 z-10 bg-white transition-all duration-500 ${
          isFooterFixed ? 'fixed bottom-0 left-0 right-0' : 'relative'
        } ${
          isFooterVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-400">
            <a
              href="https://github.com/mattbayne83/shape-matters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-700 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span>·</span>
            <a
              href="https://github.com/mattbayne83/shape-matters/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Discussions
            </a>
            <span>·</span>
            <span>
              Built by{' '}
              <a
                href="https://mattbayne.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-700 transition-colors"
              >
                Matt Bayne
              </a>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
