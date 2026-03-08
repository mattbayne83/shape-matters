import { useMemo } from 'react';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { useCompanyStore } from '../../store/useCompanyStore';
import { SECTION_LABEL } from '../../lib/styles';
import { ShapeOverlay } from './ShapeOverlay';

const SHAPE_ICONS: Record<string, string> = {
  mesa: '▬',
  pyramid: '△',
  diamond: '◇',
  obelisk: '▮',
};

export function ShapeSection() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);

  const geo = useMemo(
    () => calcTriangleGeometry(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate]
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
            This shape difference has real consequences. When the CEO issues a directive, it must
            traverse every layer to reach the massive base — losing fidelity at each hop. The{' '}
            <strong>center of mass</strong> sits low in the org (where the people are), but
            authority sits high. The wider the gap between these two, the harder it is for
            leadership to actually move the organization. This is why depth kills agility.
          </p>
        </div>

        {/* Shape classification badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{SHAPE_ICONS[geo.shapeClass] ?? '?'}</span>
          <span className="text-sm font-bold text-slate-900">{geo.shapeClassLabel}</span>
          <span className="text-[10px] text-slate-400 ml-1">
            — slope {geo.slopeAngle.toFixed(0)}° · shape gap {(geo.totalShapeGap * 100).toFixed(1)}%
          </span>
        </div>

        {/* Hero visualization */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className={`${SECTION_LABEL} mb-1`}>
            Shape Overlay — Idealized Triangle vs. Actual Org
          </div>
          <div className="text-[10px] text-slate-500 mb-3">
            Dashed: linear triangle · Solid: exponential org shape · Shaded: shape gap (hidden cost zone) · Purple dot: center of mass
          </div>
          <ShapeOverlay
            levels={levels}
            employees={headcount}
            fidelityRate={fidelityRate}
          />
        </div>
      </div>
    </section>
  );
}
