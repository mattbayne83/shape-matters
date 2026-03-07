import { useCompanyStore } from '../../store/useCompanyStore';
import { SECTION_LABEL } from '../../lib/styles';
import { DecayCurve } from './DecayCurve';

export function TheoryView() {
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);

  return (
    <div>
      {/* Core thesis */}
      <div className="text-sm text-slate-700 leading-relaxed mb-6 max-w-3xl">
        <p className="mb-3">
          <strong className="text-slate-900">Core Thesis:</strong> Each management layer acts as a{' '}
          <em>lossy relay</em> in an information network. At a per-layer fidelity rate of{' '}
          <span className="text-org-green font-bold font-mono">{fidelityRate}%</span>, compound
          degradation means leaders in deep orgs are making decisions on a fraction of ground truth.
        </p>
        <p className="mb-3">
          <strong className="text-slate-900">Bartlett's Serial Reproduction (1932):</strong> When
          information passes between people sequentially, original content declines markedly at each
          link while distortion and rationalization increase. The same information retold by the{' '}
          <em>same</em> person stays stable — it's the <em>relay</em> that destroys signal.
        </p>
        <p>
          <strong className="text-slate-900">Three Cost Channels:</strong> (1){' '}
          <em>Fidelity loss</em> — signal degrades per layer. (2) <em>Communication complexity</em>{' '}
          — bottleneck nodes create queues. (3) <em>Decision latency</em> — round-trip time scales
          with 2x (levels - 1).
        </p>
      </div>

      {/* Decay curve — replaces old 4-panel comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className={`${SECTION_LABEL} mb-1`}>
          Signal Decay at {fidelityRate}% per-layer retention
        </div>
        <div className="text-[10px] text-slate-500 mb-3">
          Solid line: upward fidelity (IC → CEO) · Dashed line: round-trip fidelity
        </div>
        <DecayCurve fidelityRate={fidelityRate} />
      </div>

      {/* Decision cost formula */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <div className={`${SECTION_LABEL} mb-2.5`}>
          Decision Cost Formula
        </div>
        <div className="font-mono text-sm text-slate-800 leading-loose space-y-0.5">
          <div>
            <span className="text-slate-400">Signal Fidelity (up){'   '}</span> = r
            <sup>(L-1)</sup>{' '}
            <span className="text-slate-400">where r = per-layer retention, L = levels</span>
          </div>
          <div>
            <span className="text-slate-400">Round-trip Fidelity{'    '}</span> = r
            <sup>2(L-1)</sup>
          </div>
          <div>
            <span className="text-slate-400">Avg Span of Control{'   '}</span> = N
            <sup>1/L</sup>{' '}
            <span className="text-slate-400">where N = total employees</span>
          </div>
          <div>
            <span className="text-slate-400">Flatness Index{'         '}</span> = Span / L{' '}
            <span className="text-slate-400">— higher is flatter</span>
          </div>
          <div>
            <span className="text-slate-400">Decision Latency{'       '}</span> = 2(L-1) x t
            <sub>relay</sub>
          </div>
          <div>
            <span className="text-slate-400">Bottleneck Nodes{'       '}</span> = Sum(N / Span
            <sup>k</sup>) <span className="text-slate-400">for k = 1..L-1</span>
          </div>
        </div>
      </div>

      {/* Deming / Gemba section */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="text-sm font-extrabold text-amber-800 mb-1">
          Deming's Quality Framework & the Gemba Walk
        </div>
        <div className="text-[11px] text-slate-500 mb-4">
          Supporting evidence from W. Edwards Deming (1982) and the Toyota Production System
        </div>

        <div className="text-sm text-slate-700 leading-relaxed mb-5">
          <p className="mb-3">
            Deming's work provides <em>independent theoretical validation</em> of the org-shape
            thesis from a completely different angle — quality management rather than communication
            theory. The connection: if organizational layers degrade information fidelity (our signal
            model), then{' '}
            <strong className="text-slate-900">
              every management layer is a source of variation
            </strong>{' '}
            in Deming's framework.
          </p>
          <p className="mb-3">
            The <strong className="text-amber-800">Gemba Walk</strong> exists because Toyota
            recognized that <em>reports traveling up a hierarchy cannot substitute for direct
            observation</em>. It is, in engineering terms, a{' '}
            <strong className="text-slate-900">
              bypass circuit around the lossy relay chain
            </strong>.
          </p>
          <p>
            If hierarchical communication were lossless, the Gemba Walk would be unnecessary. Its
            very existence is an admission that tall structures degrade information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-lg p-3.5 border border-slate-200">
            <div className="text-[11px] font-bold text-amber-800 uppercase mb-2.5">
              Deming's Points That Map to Shape Theory
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
              <div>
                <span className="text-amber-800 font-bold">Point 8:</span>{' '}
                <strong>Drive out fear</strong> — Fear increases at each hierarchical layer.
                Subordinates filter information upward to avoid blame.
              </div>
              <div>
                <span className="text-amber-800 font-bold">Point 9:</span>{' '}
                <strong>Break down barriers</strong> — Hierarchical silos force lateral
                communication to route vertically, multiplying relay hops.
              </div>
              <div>
                <span className="text-amber-800 font-bold">Point 11:</span>{' '}
                <strong>Eliminate management by numbers</strong> — Aggregated KPIs climbing a tall
                hierarchy are lossy summaries.
              </div>
              <div>
                <span className="text-amber-800 font-bold">Point 12:</span>{' '}
                <strong>Remove barriers to pride</strong> — Deep hierarchies distance
                decision-makers from the people who understand the work.
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3.5 border border-slate-200">
            <div className="text-[11px] font-bold text-green-600 uppercase mb-2.5">
              The Gemba Walk as Bypass Circuit
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
              <div>
                <span className="text-green-600 font-bold">Go See</span> — Direct observation
                bypasses every relay. Fidelity = 100%.
              </div>
              <div>
                <span className="text-green-600 font-bold">Ask Why</span> — First-person inquiry
                avoids the editorial filtering each layer adds.
              </div>
              <div>
                <span className="text-green-600 font-bold">Show Respect</span> — Eliminates fear
                (Deming Point 8) that causes subordinates to distort upward communication.
              </div>
              <div className="mt-2.5 p-2 bg-green-50 rounded text-[11px] text-slate-700">
                <strong className="text-green-600">Key insight:</strong> In a flat org, the Gemba
                Walk is short or unnecessary — leadership is already close to the work. The need for
                Gemba Walks is itself a measure of structural dysfunction.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-slate-200">
          <div className="text-[11px] font-bold text-violet-600 uppercase mb-2.5">
            Unified Model — Bartlett + Deming + Shape Theory
          </div>
          <div className="font-mono text-xs text-slate-800 leading-loose space-y-0.5">
            <div>
              <span className="text-slate-400">Bartlett (1932): </span>Information degrades per
              serial relay →{' '}
              <span className="text-red-600">fidelity loss is structural</span>
            </div>
            <div>
              <span className="text-slate-400">Deming (1982):{'  '}</span>Every layer adds variation
              + fear →{' '}
              <span className="text-red-600">quality degrades with hierarchy depth</span>
            </div>
            <div>
              <span className="text-slate-400">Toyota (1950s): </span>Gemba Walk invented to bypass
              hierarchy →{' '}
              <span className="text-red-600">hierarchy acknowledged as problem</span>
            </div>
            <div>
              <span className="text-slate-400">Shape Theory:{'   '}</span>Flatness Index predicts
              fidelity + productivity →{' '}
              <span className="text-green-600">testable hypothesis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
