import { useState, useMemo } from 'react';
import { calcTriangleGeometry, calcRestructuringImpact } from '../../lib/triangleGeometry';
import { SECTION_LABEL } from '../../lib/styles';
import { ShapeOverlay } from './ShapeOverlay';
import { InertiaProfile } from './InertiaProfile';
import { MetricCard } from './MetricCard';

const SHAPE_ICONS: Record<string, string> = {
  mesa: '▬',
  pyramid: '△',
  diamond: '◇',
  obelisk: '▮',
};

export function ShapeSection({ fidelityRate }: { fidelityRate: number }) {
  const [geoLevels, setGeoLevels] = useState(6);
  const [geoEmployees, setGeoEmployees] = useState(3000);
  const geo = calcTriangleGeometry(geoLevels, geoEmployees);
  const restructure = useMemo(
    () => calcRestructuringImpact(geoLevels, geoEmployees, fidelityRate),
    [geoLevels, geoEmployees, fidelityRate]
  );

  return (
    <section id="shape" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className={`${SECTION_LABEL} mb-3`}>The Shape</div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">
          Triangles, Horns, and the Physics of Hierarchy
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
            Treating the org chart as a physical object reveals powerful structural properties.
            Like a flywheel, an organization has a <strong>moment of inertia</strong> — the more
            employee mass concentrated far from the center, the harder it is to change direction.
            A figure skater pulling her arms in spins faster; an org that removes bloated middle
            layers becomes more agile. The <strong>center of mass</strong> shows where power
            actually concentrates — often lower (nearer the base) than leaders assume.
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

        {/* Shape classification badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{SHAPE_ICONS[geo.shapeClass] ?? '?'}</span>
          <span className="text-sm font-bold text-slate-900">{geo.shapeClassLabel}</span>
          <span className="text-[10px] text-slate-400 ml-1">
            — classified by slope angle ({geo.slopeAngle.toFixed(0)}°) and shape gap ({(geo.totalShapeGap * 100).toFixed(1)}%)
          </span>
        </div>

        {/* Hero visualization */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className={`${SECTION_LABEL} mb-1`}>
            Shape Overlay — Idealized Triangle vs. Actual Org
          </div>
          <div className="text-[10px] text-slate-500 mb-3">
            Dashed: linear triangle · Solid: exponential org shape · Shaded: shape gap (hidden cost zone) · Purple dot: center of mass
          </div>
          <ShapeOverlay
            levels={geoLevels}
            employees={geoEmployees}
            fidelityRate={fidelityRate}
          />
        </div>

        {/* Metric cards — intuitive labels with physical analogies */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
          <MetricCard
            label="Hierarchy Steepness"
            value={geo.slopeAngle.toFixed(1)}
            unit="deg"
            sub={geo.slopeAngle > 70 ? 'Very steep — narrow span' : geo.slopeAngle > 45 ? 'Moderate steepness' : 'Shallow — wide span'}
            accent={geo.slopeAngle > 70 ? '#dc2626' : geo.slopeAngle > 45 ? '#d97706' : '#16a34a'}
          />
          <MetricCard
            label="Power Center"
            value={geo.decisionGravityRatio.toFixed(3)}
            sub={geo.decisionGravityRatio < 0.15 ? 'Near the work — decentralized' : geo.decisionGravityRatio < 0.25 ? 'Moderate concentration' : 'At the apex — centralized'}
            accent={geo.decisionGravityRatio < 0.15 ? '#16a34a' : geo.decisionGravityRatio < 0.25 ? '#d97706' : '#dc2626'}
          />
          <MetricCard
            label="Pivot Speed"
            value={geo.agilityScore.toFixed(3)}
            sub={geo.agilityScore > 0.9 ? 'Fast — low inertia' : geo.agilityScore > 0.7 ? 'Moderate resistance' : 'Slow — high inertia'}
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

        {/* Inertia decomposition — "Where does rigidity come from?" */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className={`${SECTION_LABEL} mb-1`}>
            Change Resistance by Layer
          </div>
          <div className="text-[10px] text-slate-500 mb-2">
            Each bar shows a layer's contribution to organizational inertia (count × distance² from center of mass).
            Layers far from the center of mass with many people contribute the most rigidity.
          </div>
          <InertiaProfile
            layerInertia={geo.layerInertia}
            levels={geoLevels}
            peakLayer={geo.peakInertiaLayer}
            actualCentroidHeight={geo.actualCentroidHeight}
          />
        </div>

        {/* Restructuring impact — "What if -1 level?" */}
        {restructure && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`${SECTION_LABEL} mb-1`}>
              What If You Removed a Layer?
            </div>
            <div className="text-[10px] text-slate-500 mb-3">
              Impact of flattening from {restructure.currentLevels} → {restructure.proposedLevels} levels with the same {geoEmployees.toLocaleString()} employees
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Pivot Speed</div>
                <div className="text-lg font-black font-mono text-green-600">
                  +{(restructure.agilityDelta * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">faster pivots</div>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Inertia</div>
                <div className="text-lg font-black font-mono text-green-600">
                  -{restructure.inertiaReduction.toFixed(0)}%
                </div>
                <div className="text-[10px] text-slate-400">less rigidity</div>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Power Center</div>
                <div className="text-lg font-black font-mono" style={{ color: restructure.gravityDelta < 0 ? '#16a34a' : '#d97706' }}>
                  {restructure.gravityDelta < 0 ? '' : '+'}{(restructure.gravityDelta * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">{restructure.gravityDelta < 0 ? 'more decentralized' : 'more concentrated'}</div>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Signal Fidelity</div>
                <div className="text-lg font-black font-mono text-green-600">
                  +{restructure.fidelityGain.toFixed(1)}pp
                </div>
                <div className="text-[10px] text-slate-400">better signal to top</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
