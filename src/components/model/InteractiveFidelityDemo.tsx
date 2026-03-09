import { useState, useMemo } from 'react';
import { fidelityColor, metricColor } from '../../lib/fidelityColor';
import { SECTION_LABEL } from '../../lib/styles';
import { SignalCascade } from './SignalCascade';
import { calcDepthTax } from '../../lib/depthTax';
import { FlippableMetricCard } from './FlippableMetricCard';
import { AnimatedCounter } from './AnimatedCounter';
import { useCompanyStore } from '../../store/useCompanyStore';

export function InteractiveFidelityDemo() {
  const [rate, setRate] = useState(82);
  const levels = useCompanyStore((s) => s.levels);
  const setLevels = useCompanyStore((s) => s.setLevels);

  // Calculate base fidelity manually for immediate display 
  const fidelityNum = Math.pow(rate / 100, levels - 1) * 100;

  // Use depthTax to get the new metrics based on a standard headcount (e.g. 1000)
  // Headcount only really matters for throughput volume, not the core ratios
  const tax = useMemo(() => calcDepthTax(levels, 1000, rate), [levels, rate]);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 mt-6">
      <div className={`${SECTION_LABEL} mb-6`}>
        Interactive: Signal Degradation
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* left column: inputs & impacts */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col gap-6">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="demo-fidelity" className="text-[11px] font-bold text-stone-700 uppercase">
                  Per-layer fidelity
                </label>
                <span className="font-mono font-bold text-stone-900 text-sm">{rate}%</span>
              </div>
              <input
                id="demo-fidelity"
                type="range"
                min={50}
                max={98}
                value={rate}
                onChange={(e) => setRate(+e.target.value)}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <label htmlFor="demo-levels" className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    Org Levels
                  </label>
                  <div className="text-xs text-stone-500 mt-1">Adjust depth of hierarchy</div>
                </div>
                <span className="text-2xl font-black font-sans tabular-nums text-stone-900 bg-white px-3 py-1 rounded-md shadow-sm border border-stone-200">
                  {levels}
                </span>
              </div>
              <input
                id="demo-levels"
                type="range"
                min={1}
                max={15}
                value={levels}
                onChange={(e) => setLevels(+e.target.value)}
                className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
              />
            </div>
          </div>

          {/* New Metrics below the inputs */}
          <div className="grid grid-cols-2 gap-4">
            <FlippableMetricCard
              label="Decision Quality"
              value={`${(tax.decisionQuality * 100).toFixed(1)}%`}
              sub="compound fidelity × latency"
              color={metricColor(tax.decisionQuality)}
              minOut={0}
              maxOut={100}
              currentOut={tax.decisionQuality * 100}
              inverseBest={false}
              bestLabel="High quality"
              worstLabel="Degraded"
            />
            <FlippableMetricCard
              label="Drift Cost"
              value={`${tax.ninetyDayAccuracy.toFixed(1)}%`}
              sub="90-day accuracy"
              color={metricColor(tax.ninetyDayAccuracy / 100)}
              minOut={0}
              maxOut={100}
              currentOut={tax.ninetyDayAccuracy}
              inverseBest={false}
              bestLabel="Accurate"
              worstLabel="Drifted"
            />
          </div>

        </div>

        {/* right column: visual */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">

          <div className="text-center mb-8">
            <AnimatedCounter
              value={fidelityNum}
              decimals={1}
              className="text-5xl md:text-6xl font-black font-mono transition-colors duration-300"
              style={{ color: fidelityColor(fidelityNum) }}
            />
            <span
              className="text-5xl md:text-6xl font-black font-mono transition-colors duration-300 ml-1"
              style={{ color: fidelityColor(fidelityNum) }}>
              %
            </span>
            <div className="text-sm text-stone-500 mt-2 font-medium">
              signal reaching the top after {levels - 1} relays
            </div>
          </div>

          <div className="w-full max-w-[360px]">
            <SignalCascade levels={levels} fidelityRate={rate} semantic />
          </div>

        </div>
      </div>
    </div>
  );
}
