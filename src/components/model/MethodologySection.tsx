import { METHODOLOGY_METRICS } from '../../data/methodologyMetrics';
import { MethodologyCard } from './MethodologyCard';
import { Prose } from '../ui/Prose';

const primary = METHODOLOGY_METRICS.filter((m) => m.category === 'primary');
const secondary = METHODOLOGY_METRICS.filter((m) => m.category === 'secondary');

export function MethodologySection() {
  return (
    <>
      {/* Header */}
      <Prose>
        <h3>How We Calculate</h3>
        <p>
          Each card below corresponds to a metric in the Model Your Org section.
          Variables: <strong>r</strong> = per-layer fidelity rate (default 0.82),{' '}
          <strong>L</strong> = number of levels, <strong>N</strong> = total employees,{' '}
          <strong>n<sub>k</sub></strong> = employees at layer k (layer 0 = ICs, layer L-1 = CEO).
        </p>
      </Prose>

      {/* ── Primary Metrics Grid ── */}
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-8 mb-3">
        Primary Metrics
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {primary.map((m) => (
          <MethodologyCard key={m.id} {...m} />
        ))}
      </div>

      {/* ── Secondary Metrics Grid ── */}
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-10 mb-3">
        Secondary Metrics
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {secondary.map((m) => (
          <MethodologyCard key={m.id} {...m} />
        ))}
      </div>

      {/* ── Geometry Internals ── */}
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-10 mb-3">
        Geometry Internals
      </div>
      <div className="my-2 border border-stone-200 rounded-lg p-4">
        <div className="font-mono text-sm text-stone-800 leading-loose space-y-1">
          <div>
            <span className="text-stone-400">Slope Angle{'            '}</span> = arctan(2L / span){' '}
            <span className="text-stone-400 text-xs">in degrees — steep = narrow span</span>
          </div>
          <div>
            <span className="text-stone-400">Moment of Inertia{'      '}</span> = Σ n<sub>k</sub>·(k - centroid)<sup>2</sup>{' '}
            <span className="text-stone-400 text-xs">organizational rigidity proxy</span>
          </div>
          <div>
            <span className="text-stone-400">Center of Mass{'         '}</span> = Σ(k·n<sub>k</sub>) / N{' '}
            <span className="text-stone-400 text-xs">weighted average layer position</span>
          </div>
          <div>
            <span className="text-stone-400">Round-trip Fidelity{'    '}</span> = r<sup>2(L-1)</sup>{' '}
            <span className="text-stone-400 text-xs">signal up + decision back down</span>
          </div>
        </div>
      </div>

      {/* ── Shape Classification ── */}
      <Prose>
        <h3>Shape Classification</h3>
        <p>
          Organizations are classified into four shape archetypes based on their slope angle and shape gap:
        </p>
      </Prose>

      <div className="my-6 border border-stone-200 rounded-lg p-4">
        <div className="font-mono text-sm text-stone-800 leading-loose space-y-1">
          <div>
            <span className="text-stone-400">Mesa{'                   '}</span> slope &lt; 30° or levels ≤ 2{' '}
            <span className="text-stone-400 text-xs">— flat and wide, minimal hierarchy</span>
          </div>
          <div>
            <span className="text-stone-400">Pyramid{'                '}</span> slope 30-55°, gap &lt; 8%{' '}
            <span className="text-stone-400 text-xs">— balanced, closest to idealized triangle</span>
          </div>
          <div>
            <span className="text-stone-400">Diamond{'                '}</span> gap &gt; 8%, slope &gt; 40°{' '}
            <span className="text-stone-400 text-xs">— bloated middle layers, hidden costs</span>
          </div>
          <div>
            <span className="text-stone-400">Obelisk{'                '}</span> slope &gt; 55°{' '}
            <span className="text-stone-400 text-xs">— steep and deep, narrow span of control</span>
          </div>
        </div>
      </div>

      {/* ── Assumptions, Data Sources, Limitations ── */}
      <Prose>
        <h3>Key Assumptions</h3>
        <ul>
          <li>
            <strong>Per-layer fidelity rate (default 82%)</strong> — Based on serial
            reproduction research. Empirical estimates from Bartlett (1932) and replications
            (Roediger et al., 2014) suggest 70-90% per relay depending on message complexity.
            The rate is user-adjustable.
          </li>
          <li>
            <strong>Uniform span assumption</strong> — The model uses N<sup>1/L</sup> to
            estimate average span of control, assuming a roughly uniform distribution. Real
            organizations have variable spans across levels.
          </li>
          <li>
            <strong>Communication loss ($10,140/employee/year)</strong> — From Axios HQ 2025
            State of Internal Communications report.
          </li>
          <li>
            <strong>Triangle model assumes symmetric narrowing</strong> — Equal span at all
            layers. Real organizations have variable spans. The Shape Gap metric quantifies
            structural deviation from this idealized linear hierarchy.
          </li>
        </ul>

        <h3>Data Sources</h3>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Used For</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://www.cambridge.org/core/books/remembering/7F58B9793DAD79782D4AE989FAA287D1" target="_blank" rel="noopener noreferrer">Bartlett, F.C.</a></td>
              <td>Serial reproduction theory, fidelity degradation model</td>
              <td>1932</td>
            </tr>
            <tr>
              <td><a href="https://doi.org/10.1016/j.jarmac.2014.05.004" target="_blank" rel="noopener noreferrer">Roediger et al.</a></td>
              <td>Modern replication of serial reproduction effects</td>
              <td>2014</td>
            </tr>
            <tr>
              <td><a href="https://deming.org/explore/fourteen-points/" target="_blank" rel="noopener noreferrer">Deming, W.E.</a></td>
              <td>Quality framework, variation theory, 14 points</td>
              <td>1982</td>
            </tr>
            <tr>
              <td><a href="https://www.amazon.com/Toyota-Production-System-Beyond-Large-Scale/dp/0915299143" target="_blank" rel="noopener noreferrer">Ohno, Taiichi</a></td>
              <td>Toyota Production System, Gemba Walk methodology</td>
              <td>1950s-1988</td>
            </tr>
            <tr>
              <td><a href="https://www.axioshq.com/research/state-of-internal-communications-report" target="_blank" rel="noopener noreferrer">Axios HQ</a></td>
              <td>Annual communication loss estimate ($10,140/employee)</td>
              <td>2025</td>
            </tr>
            <tr>
              <td><a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=10-K" target="_blank" rel="noopener noreferrer">SEC 10-K filings</a></td>
              <td>Company employee counts and organizational data</td>
              <td>2024</td>
            </tr>
            <tr>
              <td><a href="https://www.microsoft.com/en-us/research/blog/advancing-organizational-science-using-network-machine-learning-to-measure-innovation-in-the-workplace/" target="_blank" rel="noopener noreferrer">Microsoft Research</a></td>
              <td>Organizational communication network studies</td>
              <td>2024</td>
            </tr>
          </tbody>
        </table>

        <h3>Limitations</h3>
        <ul>
          <li>
            <strong>Organizational levels are often ambiguous</strong> — Different counting
            methods produce different numbers. The model uses "levels from CEO to frontline IC."
          </li>
          <li>
            <strong>The model assumes serial communication</strong> — Real organizations use
            parallel, skip-level, and informal channels that may partially compensate for
            hierarchical fidelity loss.
          </li>
        </ul>
      </Prose>
    </>
  );
}
