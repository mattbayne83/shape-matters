import { useState } from 'react';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { SECTION_LABEL } from '../../lib/styles';
import { ShapeOverlay } from './ShapeOverlay';
import { MetricCard } from './MetricCard';

export function ShapeSection({ fidelityRate }: { fidelityRate: number }) {
  const [geoLevels, setGeoLevels] = useState(6);
  const [geoEmployees, setGeoEmployees] = useState(3000);
  const geo = calcTriangleGeometry(geoLevels, geoEmployees);

  return (
    <section id="shape" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className={`${SECTION_LABEL} mb-3`}>The Shape</div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">
          Triangles, Horns, and the Shape Gap
        </h2>

        <div className="text-sm text-slate-700 leading-relaxed space-y-4 mb-8">
          <p>
            Organizations are often drawn as triangles — wide at the base (many ICs), narrowing to
            a point at the top (CEO). But this visual metaphor hides a critical insight: a true
            triangle narrows <em>linearly</em> at each layer, while real organizations narrow{' '}
            <em>exponentially</em>. The actual shape is closer to an{' '}
            <strong>exponential horn</strong> than a straight-sided triangle.
          </p>
          <p>
            The <strong>shape gap</strong> — the area between the idealized triangle and the actual
            exponential curve — is where hidden organizational costs accumulate. Middle layers of
            deep hierarchies are wider than a triangle predicts, meaning more relays, more
            bottleneck nodes, and more fidelity loss than the simple pyramid metaphor suggests.
          </p>
          <p>
            Triangle geometry also reveals structural properties of organizations:{' '}
            <strong>slope angle</strong> encodes span of control (steep = narrow span, deep
            hierarchy), <strong>decision gravity</strong> shows where power concentrates, and{' '}
            <strong>agility</strong> measures how readily the structure can adapt.
          </p>
        </div>

        {/* Interactive sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="shape-levels" className="text-[11px] text-slate-500 block mb-1.5">
              Org Levels (Height)
            </label>
            <input
              id="shape-levels"
              type="range"
              min={2}
              max={15}
              value={geoLevels}
              onChange={(e) => setGeoLevels(+e.target.value)}
              className="w-full accent-red-600"
            />
            <div className="text-xl font-extrabold text-red-600 font-mono text-center">
              {geoLevels}
            </div>
          </div>
          <div>
            <label htmlFor="shape-employees" className="text-[11px] text-slate-500 block mb-1.5">
              Total Employees
            </label>
            <input
              id="shape-employees"
              type="range"
              min={50}
              max={50000}
              step={50}
              value={geoEmployees}
              onChange={(e) => setGeoEmployees(+e.target.value)}
              className="w-full accent-slate-900"
            />
            <div className="text-xl font-extrabold text-slate-900 font-mono text-center">
              {geoEmployees.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Hero visualization */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className={`${SECTION_LABEL} mb-1`}>
            Shape Overlay — Idealized Triangle vs. Actual Org
          </div>
          <div className="text-[10px] text-slate-500 mb-3">
            Dashed: linear triangle · Solid: exponential org shape · Shaded: shape gap (hidden cost zone)
          </div>
          <ShapeOverlay
            levels={geoLevels}
            employees={geoEmployees}
            fidelityRate={fidelityRate}
          />
        </div>

        {/* Metric cards — 4 meaningful metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <MetricCard
            label="Slope Angle"
            value={geo.slopeAngle.toFixed(1)}
            unit="deg"
            sub={geo.slopeAngle > 70 ? 'Very steep — narrow span' : geo.slopeAngle > 45 ? 'Moderate steepness' : 'Shallow — wide span'}
            accent={geo.slopeAngle > 70 ? '#dc2626' : geo.slopeAngle > 45 ? '#d97706' : '#16a34a'}
          />
          <MetricCard
            label="Decision Gravity"
            value={geo.decisionGravityRatio.toFixed(3)}
            sub={geo.decisionGravityRatio < 0.15 ? 'Decentralized — near the work' : geo.decisionGravityRatio < 0.25 ? 'Moderate concentration' : 'Concentrated at apex'}
            accent={geo.decisionGravityRatio < 0.15 ? '#16a34a' : geo.decisionGravityRatio < 0.25 ? '#d97706' : '#dc2626'}
          />
          <MetricCard
            label="Agility Score"
            value={geo.agilityScore.toFixed(3)}
            sub={geo.agilityScore > 0.9 ? 'Highly agile' : geo.agilityScore > 0.7 ? 'Moderate agility' : 'High inertia — resists change'}
            accent={geo.agilityScore > 0.9 ? '#16a34a' : geo.agilityScore > 0.7 ? '#d97706' : '#dc2626'}
          />
          <MetricCard
            label="Shape Gap"
            value={(geo.totalShapeGap * 100).toFixed(1)}
            unit="%"
            sub="Triangle vs. actual divergence"
            accent={geo.totalShapeGap > 0.15 ? '#dc2626' : geo.totalShapeGap > 0.05 ? '#d97706' : '#16a34a'}
          />
        </div>
      </div>
    </section>
  );
}
