import { useEffect, useState } from 'react';
import { Github, MessageCircle } from 'lucide-react';
import { InteractiveFidelityDemo } from '../components/model/InteractiveFidelityDemo';
import { GembaComparison } from '../components/model/GembaComparison';
import { ComparisonView } from '../components/model/ComparisonView';
import { ModelYourOrg } from '../components/model/ModelYourOrg';
import { ObjectionsSection } from '../components/model/ObjectionsSection';
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

      {/* ─── THE TELEPHONE EFFECT (emotional lead) ─── */}
      <SimulateSection />

      {/* ─── THE PROBLEM (the math behind it) ─── */}
      <section id="problem" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Premise 2 · Losses Compound with Depth</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-6">
            Why This Happens
          </h2>
          <div className="text-sm text-stone-700 leading-relaxed space-y-4 mb-8">
            <p>
              What you just watched isn't a bug — it's physics. In 1932, Frederic Bartlett ran the
              first controlled study of serial reproduction. He passed a short story through chains
              of 6-10 people and measured what survived. Content shrank 40-50% by the 4th relay.
              Unfamiliar details were replaced with familiar ones. But when the <em>same person</em>{' '}
              retold the story over weeks, it stabilized. It was the{' '}
              <strong>handoff between people</strong> — the relay — that destroyed signal.
            </p>
            <p>
              If each management layer retains roughly 80-85% of the information it receives, we
              can model cumulative fidelity loss mathematically. At 82% per-layer retention, an
              organization 9 layers deep retains only <strong>17% of the original signal</strong> by the
              time information reaches the CEO. Leaders in deep hierarchies are making strategic
              decisions based on <em>systematically degraded</em> information.
            </p>
          </div>

          <InteractiveFidelityDemo />
        </FadeIn>
      </section>

      {/* ─── THE EVIDENCE (trimmed — Gemba + unified model only) ─── */}
      <section id="evidence" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Premise 3 · The Best Operators Already Know</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-6">
            They Already Knew
          </h2>

          <div className="text-sm text-stone-700 leading-relaxed space-y-4 mb-8">
            <p>
              Toyota's leaders understood this decades before organizational theory formalized it.
              Their solution — the Gemba Walk — sends leaders directly to where value is created,
              bypassing every relay in the hierarchy. In engineering terms, it's a{' '}
              <strong>bypass circuit around the lossy relay chain</strong>.
            </p>
            <p>
              The meta-insight: if hierarchical communication were lossless, the Gemba Walk would
              be unnecessary. <strong>Its very existence is an admission that tall structures
              degrade information.</strong>
            </p>
          </div>

          <div className="mb-8">
            <GembaComparison />
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="font-mono text-sm text-stone-800 leading-loose space-y-0.5">
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
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── THE PROOF ─── */}
      <section id="proof" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Premises, Tested</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            Real Companies, Real Structures
          </h2>
          <p className="text-sm text-stone-500 mb-8 max-w-2xl">
            The model isn't hypothetical. Here's what compound signal decay looks like inside
            6 real organizations — from Valve's zero-relay flat structure to Amazon's
            9-layer hierarchy.
          </p>
          <ComparisonView />
        </FadeIn>
      </section>

      {/* ─── THE OBJECTIONS ─── */}
      <ObjectionsSection />

      {/* ─── THEREFORE ─── */}
      <section className="py-12 md:py-16 px-6 md:px-12">
        <FadeIn className="max-w-3xl mx-auto text-center">
          <div className={`${SECTION_LABEL} mb-3`}>Therefore</div>
          <p className="text-lg text-stone-500 font-medium italic">
            If the premises hold, the only unknown left is your numbers.
          </p>
        </FadeIn>
      </section>

      {/* ─── MODEL YOUR ORG ─── */}
      <section id="model" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Conclusion</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            How Much Signal Survives Your Structure?
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            You've seen the premises and the proof. This is the conclusion, applied:
            your depth, your spans, your decision mix — your ceiling.
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
