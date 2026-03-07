import { useState, useMemo } from "react";

const REFERENCE_COMPANIES = [
  {
    name: "Chesapeake Energy",
    era: "2009-2013 (McClendon)",
    levels: 4,
    employees: 12600,
    revenue: 11600,
    industry: "E&P / Upstream",
    color: "#E85D2A",
    notes: "Aubrey McClendon's famous flat-org mandate"
  },
  {
    name: "Williams Companies",
    era: "2024",
    levels: 7.5,
    employees: 5829,
    revenue: 10503,
    industry: "Midstream",
    color: "#2563EB",
    notes: "7-8 levels estimated"
  },
  {
    name: "ONEOK",
    era: "2024",
    levels: 9,
    employees: 5177,
    revenue: 21698,
    industry: "Midstream",
    color: "#7C3AED",
    notes: "9 levels currently"
  }
];

function calcOrgMetrics(levels, employees, revenue, fidelityRate) {
  const avgSpan = Math.pow(employees, 1 / levels);
  const flatnessIndex = avgSpan / levels;
  const fidelityAtTop = Math.pow(fidelityRate / 100, levels - 1);
  const fidelityAtTopPct = fidelityAtTop * 100;
  const roundTripLayers = (levels - 1) * 2;
  const roundTripFidelity = Math.pow(fidelityRate / 100, roundTripLayers) * 100;
  const revPerEmployeeM = revenue / employees;
  const revPerEmployeeK = revPerEmployeeM * 1000;
  const managersEstimate = Array.from({ length: levels - 1 }, (_, i) =>
    Math.round(employees / Math.pow(avgSpan, i + 1))
  ).reduce((a, b) => a + b, 0);
  const managerRatio = managersEstimate / employees;
  const icCount = employees - managersEstimate;
  const annualCommLoss = employees * 10140;

  return {
    avgSpan: avgSpan.toFixed(1),
    flatnessIndex: flatnessIndex.toFixed(2),
    fidelityAtTopPct: fidelityAtTopPct.toFixed(1),
    roundTripFidelity: roundTripFidelity.toFixed(1),
    roundTripLayers,
    revPerEmployeeM,
    revPerEmployeeK,
    managersEstimate,
    managerRatio: (managerRatio * 100).toFixed(1),
    icCount,
    annualCommLoss,
    levels,
    employees,
    revenue
  };
}

function formatRevPerEmployee(rpeM) {
  const rpeK = rpeM * 1000;
  if (rpeK >= 1000) return `$${rpeM.toFixed(2)}M`;
  return `$${Math.round(rpeK)}K`;
}

function FidelityBar({ pct, label, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: pct > 60 ? "#16a34a" : pct > 40 ? "#ca8a04" : "#dc2626" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${Math.max(pct, 2)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 4,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, sub, accent }) {
  return (
    <div style={{
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "14px 16px",
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#0f172a", lineHeight: 1.1, fontFamily: "'DM Mono', monospace" }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function CompanyColumn({ company, fidelityRate }) {
  const m = calcOrgMetrics(company.levels, company.employees, company.revenue, fidelityRate);
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderTop: `3px solid ${company.color}`,
      borderRadius: 12,
      padding: 20,
      flex: 1,
      minWidth: 220,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: company.color, marginBottom: 2 }}>{company.name}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>{company.era} · {company.industry}</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Levels</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'DM Mono', monospace" }}>{company.levels}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Employees</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'DM Mono', monospace" }}>{(company.employees / 1000).toFixed(1)}k</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Avg Span</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'DM Mono', monospace" }}>{m.avgSpan}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Flatness</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: company.color, fontFamily: "'DM Mono', monospace" }}>{m.flatnessIndex}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Signal Fidelity</div>
        <FidelityBar pct={m.fidelityAtTopPct} label="Up (IC → CEO)" color={company.color} />
        <FidelityBar pct={m.roundTripFidelity} label={`Round-trip (${m.roundTripLayers} relays)`} color="#d97706" />
      </div>

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Productivity</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Rev / Employee</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a", fontFamily: "'DM Mono', monospace" }}>
              {formatRevPerEmployee(m.revPerEmployeeM)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Manager Ratio</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ca8a04", fontFamily: "'DM Mono', monospace" }}>{m.managerRatio}%</div>
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 12, fontStyle: "italic" }}>{company.notes}</div>
    </div>
  );
}

function LayerDiagram({ levels, fidelityRate, color }) {
  const layers = Array.from({ length: levels }, (_, i) => {
    const fidelity = Math.pow(fidelityRate / 100, i) * 100;
    return { level: i, fidelity };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 0" }}>
      {layers.map((l, i) => {
        const width = 30 + (i / (levels - 1)) * 70;
        const opacity = l.fidelity / 100;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
            <div style={{ fontSize: 9, color: "#94a3b8", width: 20, textAlign: "right" }}>L{i}</div>
            <div style={{
              height: 14,
              width: `${width}%`,
              background: color,
              opacity: Math.max(opacity, 0.15),
              borderRadius: 3,
              transition: "all 0.4s ease"
            }} />
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{l.fidelity.toFixed(0)}%</div>
          </div>
        );
      })}
    </div>
  );
}

function CustomOrgTab({ fidelityRate }) {
  const [levels, setLevels] = useState(6);
  const [employees, setEmployees] = useState(3000);
  const [revenue, setRevenue] = useState(5000);
  
  const m = calcOrgMetrics(levels, employees, revenue, fidelityRate);
  
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6 }}>Org Levels (Height)</label>
          <input type="range" min={2} max={15} value={levels} onChange={e => setLevels(+e.target.value)}
            style={{ width: "100%", accentColor: "#16a34a" }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a", fontFamily: "'DM Mono', monospace", textAlign: "center" }}>{levels}</div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6 }}>Total Employees</label>
          <input type="range" min={50} max={50000} step={50} value={employees} onChange={e => setEmployees(+e.target.value)}
            style={{ width: "100%", accentColor: "#2563eb" }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb", fontFamily: "'DM Mono', monospace", textAlign: "center" }}>{employees.toLocaleString()}</div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6 }}>Revenue ($M)</label>
          <input type="range" min={10} max={100000} step={10} value={revenue} onChange={e => setRevenue(+e.target.value)}
            style={{ width: "100%", accentColor: "#7c3aed" }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed", fontFamily: "'DM Mono', monospace", textAlign: "center" }}>${revenue.toLocaleString()}M</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        <MetricCard label="Avg Span of Control" value={m.avgSpan} unit="reports" accent="#16a34a" />
        <MetricCard label="Flatness Index" value={m.flatnessIndex} unit="ratio" sub="Higher = flatter" accent="#2563eb" />
        <MetricCard label="Signal at Top" value={m.fidelityAtTopPct} unit="%" sub={`After ${levels - 1} relays`} accent={parseFloat(m.fidelityAtTopPct) > 50 ? "#16a34a" : "#dc2626"} />
        <MetricCard label="Rev / Employee" value={formatRevPerEmployee(m.revPerEmployeeM)} unit="" accent="#7c3aed" />
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        <MetricCard label="Round-Trip Fidelity" value={m.roundTripFidelity} unit="%" sub={`${m.roundTripLayers} relay hops`} accent="#d97706" />
        <MetricCard label="Est. Managers" value={m.managersEstimate.toLocaleString()} unit="" sub={`${m.managerRatio}% of headcount`} accent="#ca8a04" />
        <MetricCard label="ICs (Doers)" value={m.icCount.toLocaleString()} unit="" accent="#0891b2" />
        <MetricCard label="Annual Comm Loss" value={`$${(m.annualCommLoss / 1000000).toFixed(1)}`} unit="M" sub="Ineffective comms cost" accent="#dc2626" />
      </div>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Signal Degradation by Layer</div>
        <LayerDiagram levels={levels} fidelityRate={fidelityRate} color="#16a34a" />
      </div>
    </div>
  );
}

function TheoryTab({ fidelityRate }) {
  const scenarios = [
    { label: "Flat (3 levels)", levels: 3, color: "#16a34a" },
    { label: "Medium (6 levels)", levels: 6, color: "#ca8a04" },
    { label: "Tall (9 levels)", levels: 9, color: "#dc2626" },
    { label: "Deep (12 levels)", levels: 12, color: "#991b1b" },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 24, maxWidth: 720 }}>
        <p style={{ marginBottom: 12 }}>
          <strong style={{ color: "#0f172a" }}>Core Thesis:</strong> Each management layer acts as a <em>lossy relay</em> in an information network. 
          At a per-layer fidelity rate of <span style={{ color: "#16a34a", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fidelityRate}%</span>, 
          compound degradation means leaders in deep orgs are making decisions on a fraction of ground truth.
        </p>
        <p style={{ marginBottom: 12 }}>
          <strong style={{ color: "#0f172a" }}>Bartlett's Serial Reproduction (1932):</strong> When information passes between people sequentially, 
          original content declines markedly at each link while distortion and rationalization increase. 
          The same information retold by the <em>same</em> person stays stable — it's the <em>relay</em> that destroys signal.
        </p>
        <p>
          <strong style={{ color: "#0f172a" }}>Three Cost Channels:</strong> (1) <em>Fidelity loss</em> — signal degrades per layer. 
          (2) <em>Communication complexity</em> — bottleneck nodes create queues. 
          (3) <em>Decision latency</em> — round-trip time scales with 2× (levels - 1).
        </p>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Fidelity Comparison at {fidelityRate}% per-layer retention
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {scenarios.map(s => {
          const upFidelity = (Math.pow(fidelityRate / 100, s.levels - 1) * 100).toFixed(1);
          const rtFidelity = (Math.pow(fidelityRate / 100, (s.levels - 1) * 2) * 100).toFixed(1);
          return (
            <div key={s.label} style={{
              background: "#ffffff",
              border: `1px solid ${s.color}33`,
              borderTop: `3px solid ${s.color}`,
              borderRadius: 10,
              padding: 16,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                {upFidelity}%
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>signal at top</div>
              <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 10, paddingTop: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#d97706", fontFamily: "'DM Mono', monospace" }}>{rtFidelity}%</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>round-trip</div>
              </div>
              <LayerDiagram levels={s.levels} fidelityRate={fidelityRate} color={s.color} />
            </div>
          );
        })}
      </div>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10, textTransform: "uppercase" }}>Decision Cost Formula</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#1e293b", lineHeight: 2 }}>
          <div><span style={{ color: "#94a3b8" }}>Signal Fidelity (up)   </span> = r<sup>(L-1)</sup> <span style={{ color: "#94a3b8" }}> where r = per-layer retention, L = levels</span></div>
          <div><span style={{ color: "#94a3b8" }}>Round-trip Fidelity    </span> = r<sup>2(L-1)</sup></div>
          <div><span style={{ color: "#94a3b8" }}>Avg Span of Control    </span> = N<sup>1/L</sup> <span style={{ color: "#94a3b8" }}> where N = total employees</span></div>
          <div><span style={{ color: "#94a3b8" }}>Flatness Index         </span> = Span / L <span style={{ color: "#94a3b8" }}> — higher is flatter</span></div>
          <div><span style={{ color: "#94a3b8" }}>Decision Latency       </span> = 2(L-1) × t<sub>relay</sub></div>
          <div><span style={{ color: "#94a3b8" }}>Bottleneck Nodes       </span> = Σ(N / Span<sup>k</sup>) <span style={{ color: "#94a3b8" }}> for k = 1..L-1</span></div>
        </div>
      </div>

      {/* Deming / Gemba Section */}
      <div style={{ marginTop: 24, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 4 }}>Deming's Quality Framework & the Gemba Walk</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Supporting evidence from W. Edwards Deming (1982) and the Toyota Production System</div>
        
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.8, marginBottom: 20 }}>
          <p style={{ marginBottom: 12 }}>
            Deming's work provides <em>independent theoretical validation</em> of the org-shape thesis from a completely different angle — quality management rather than communication theory. 
            The connection: if organizational layers degrade information fidelity (our signal model), then <strong style={{ color: "#0f172a" }}>every management layer is a source of variation</strong> in 
            Deming's framework. And Deming's entire system is built on eliminating unnecessary sources of variation.
          </p>
          <p style={{ marginBottom: 12 }}>
            The <strong style={{ color: "#92400e" }}>Gemba Walk</strong> is perhaps the most direct evidence that Toyota's own leaders understood this problem. 
            "Gemba" means "the real place" — and the practice exists because Toyota recognized that <em>reports traveling up a hierarchy cannot substitute for direct observation</em>. 
            The Gemba Walk is, in engineering terms, a <strong style={{ color: "#0f172a" }}>bypass circuit around the lossy relay chain</strong>. 
            Leaders physically go to where value is created to get unfiltered signal.
          </p>
          <p>
            If hierarchical communication were lossless, the Gemba Walk would be unnecessary. Its very existence is an admission that tall structures degrade information.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: 10 }}>Deming's Points That Map to Shape Theory</div>
            <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 6 }}><span style={{ color: "#92400e", fontWeight: 700 }}>Point 8:</span> <strong>Drive out fear</strong> — Fear increases at each hierarchical layer. Subordinates filter information upward to avoid blame, compounding the fidelity loss.</div>
              <div style={{ marginBottom: 6 }}><span style={{ color: "#92400e", fontWeight: 700 }}>Point 9:</span> <strong>Break down barriers between departments</strong> — Hierarchical silos force lateral communication to route vertically (up one chain, across, down another), multiplying relay hops.</div>
              <div style={{ marginBottom: 6 }}><span style={{ color: "#92400e", fontWeight: 700 }}>Point 11:</span> <strong>Eliminate management by numbers</strong> — Aggregated KPIs climbing a tall hierarchy are themselves lossy summaries. Each layer compresses and editorializes.</div>
              <div><span style={{ color: "#92400e", fontWeight: 700 }}>Point 12:</span> <strong>Remove barriers to pride of workmanship</strong> — Deep hierarchies distance decision-makers from the people who understand the work, leading to arbitrary mandates.</div>
            </div>
          </div>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginBottom: 10 }}>The Gemba Walk as Bypass Circuit</div>
            <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 8 }}>Toyota's Taiichi Ohno developed the Gemba Walk because he understood that <em>reports are lossy encodings of reality</em>. The practice has three rules:</div>
              <div style={{ marginBottom: 6 }}><span style={{ color: "#16a34a", fontWeight: 700 }}>Go See</span> — Direct observation bypasses every relay in the chain. Fidelity = 100%.</div>
              <div style={{ marginBottom: 6 }}><span style={{ color: "#16a34a", fontWeight: 700 }}>Ask Why</span> — First-person inquiry avoids the editorial filtering that each management layer adds.</div>
              <div style={{ marginBottom: 6 }}><span style={{ color: "#16a34a", fontWeight: 700 }}>Show Respect</span> — Eliminates the fear (Deming Point 8) that causes subordinates to distort upward communication.</div>
              <div style={{ marginTop: 10, padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, fontSize: 11, color: "#334155" }}>
                <strong style={{ color: "#16a34a" }}>Key insight:</strong> In a flat org, the Gemba Walk is short or unnecessary — leadership is already close to the work. In a tall org, it's a critical corrective mechanism. The need for Gemba Walks is itself a measure of structural dysfunction.
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 8, padding: 14, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 10 }}>Deming + Bartlett + Shape Theory — Unified Model</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1e293b", lineHeight: 2.2 }}>
            <div><span style={{ color: "#94a3b8" }}>Bartlett (1932): </span> Information degrades per serial relay → <span style={{ color: "#dc2626" }}>fidelity loss is structural</span></div>
            <div><span style={{ color: "#94a3b8" }}>Deming (1982):  </span> Every layer adds variation + fear → <span style={{ color: "#dc2626" }}>quality degrades with hierarchy depth</span></div>
            <div><span style={{ color: "#94a3b8" }}>Toyota (1950s): </span> Gemba Walk invented to bypass hierarchy → <span style={{ color: "#dc2626" }}>hierarchy acknowledged as problem</span></div>
            <div><span style={{ color: "#94a3b8" }}>Shape Theory:   </span> Flatness Index predicts fidelity + productivity → <span style={{ color: "#16a34a" }}>testable hypothesis</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrgShapeModel() {
  const [tab, setTab] = useState("compare");
  const [fidelityRate, setFidelityRate] = useState(82);

  const tabs = [
    { id: "compare", label: "Company Comparison" },
    { id: "calculator", label: "Shape Calculator" },
    { id: "theory", label: "Theory & Formulas" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      color: "#0f172a",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "32px 24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Organizational Theory Framework</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
            <span style={{ color: "#0f172a" }}>The Shape of </span>
            <span style={{ background: "linear-gradient(135deg, #16a34a, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Effectiveness</span>
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 6, maxWidth: 600 }}>
            Modeling how organizational depth degrades information fidelity, increases communication cost, and impacts productivity.
          </p>
        </div>

        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "12px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>Per-Layer Fidelity Rate</div>
          <input type="range" min={50} max={98} value={fidelityRate}
            onChange={e => setFidelityRate(+e.target.value)}
            style={{ flex: 1, accentColor: "#16a34a" }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: "#16a34a", fontFamily: "'DM Mono', monospace", minWidth: 50, textAlign: "right" }}>
            {fidelityRate}%
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", maxWidth: 200 }}>
            Based on Bartlett's serial reproduction research. 80-85% is a reasonable empirical midpoint.
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f1f5f9", borderRadius: 8, padding: 4, border: "1px solid #e2e8f0" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1,
              padding: "10px 16px",
              background: tab === t.id ? "#ffffff" : "transparent",
              color: tab === t.id ? "#0f172a" : "#94a3b8",
              border: tab === t.id ? "1px solid #e2e8f0" : "1px solid transparent",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "compare" && (
          <div>
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                Revenue Per Employee — Productivity Proxy
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                {REFERENCE_COMPANIES.map(c => {
                  const rpeM = c.revenue / c.employees;
                  const maxRpeM = Math.max(...REFERENCE_COMPANIES.map(x => x.revenue / x.employees));
                  const barH = (rpeM / maxRpeM) * 120;
                  return (
                    <div key={c.name} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: c.color, fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
                        {formatRevPerEmployee(rpeM)}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>per employee</div>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{
                          width: 60,
                          height: barH,
                          background: `linear-gradient(180deg, ${c.color}, ${c.color}44)`,
                          borderRadius: "6px 6px 0 0",
                          transition: "height 0.6s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginTop: 8 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{c.levels} levels · {(c.employees / 1000).toFixed(1)}k heads</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>${(c.revenue / 1000).toFixed(1)}B revenue</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {REFERENCE_COMPANIES.map(c => (
                <CompanyColumn key={c.name} company={c} fidelityRate={fidelityRate} />
              ))}
            </div>
            
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Key Observations
              </div>
              {(() => {
                const metrics = REFERENCE_COMPANIES.map(c => ({
                  ...c,
                  ...calcOrgMetrics(c.levels, c.employees, c.revenue, fidelityRate)
                }));
                const flattest = metrics.reduce((a, b) => parseFloat(a.flatnessIndex) > parseFloat(b.flatnessIndex) ? a : b);
                const bestRev = metrics.reduce((a, b) => a.revPerEmployeeM > b.revPerEmployeeM ? a : b);
                const bestSignal = metrics.reduce((a, b) => parseFloat(a.fidelityAtTopPct) > parseFloat(b.fidelityAtTopPct) ? a : b);
                
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Flattest Structure</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: flattest.color }}>{flattest.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Flatness: {flattest.flatnessIndex}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Highest Rev/Employee</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: bestRev.color }}>{bestRev.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{formatRevPerEmployee(bestRev.revPerEmployeeM)} per head</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Best Signal to Top</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: bestSignal.color }}>{bestSignal.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{bestSignal.fidelityAtTopPct}% fidelity</div>
                    </div>
                  </div>
                );
              })()}
              
              <div style={{ marginTop: 16, fontSize: 12, color: "#64748b", lineHeight: 1.7, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                <strong style={{ color: "#d97706" }}>⚠ Caveat:</strong> Revenue/employee comparisons across E&P (Chesapeake) vs. midstream (ONEOK, Williams) 
                are distorted by capital intensity and business model differences. ONEOK's high rev/employee reflects 
                pipeline throughput economics, not necessarily organizational efficiency. The <em>fidelity</em> and <em>shape</em> metrics 
                are the more apples-to-apples comparison — and there, the flatness advantage is clear.
              </div>
            </div>
          </div>
        )}

        {tab === "calculator" && <CustomOrgTab fidelityRate={fidelityRate} />}
        {tab === "theory" && <TheoryTab fidelityRate={fidelityRate} />}

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #e2e8f0", fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }}>
          Sources: Bartlett (1932) serial reproduction research; Roediger et al. (2014) replication; Deming, W.E. (1982) Out of the Crisis; 
          Ohno, T. — Toyota Production System / Gemba Walk methodology; Axios HQ 2025 State of Internal Communications; 
          SEC 10-K filings for CHK, OKE, WMB; Microsoft organizational communication network studies (2024). 
          Fidelity rate is an adjustable assumption — empirical estimates from serial reproduction studies suggest 70-90% per relay depending on message complexity.
        </div>
      </div>
    </div>
  );
}
