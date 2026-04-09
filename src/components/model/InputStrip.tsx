import { useEffect, useState, useCallback } from 'react';
import { Share2, Check, ChevronDown } from 'lucide-react';
import { useCompanyStore, buildShareUrl } from '../../store/useCompanyStore';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { teamMixHint } from '../../lib/contextHints';

const LOG_MIN = Math.log(50);
const LOG_MAX = Math.log(500_000);

function sliderToHeadcount(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / 100) * (LOG_MAX - LOG_MIN)));
}

function headcountToSlider(n: number): number {
  return ((Math.log(n) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
}

interface SliderTick {
  value: number;
  label: string;
}

interface CompactSliderProps {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  accent: 'ember' | 'warm-stone';
  onChange: (v: number) => void;
  /** Optional hint word that changes with slider position */
  hint?: string;
  /** Optional endpoint labels: [minLabel, maxLabel] */
  range?: [string, string];
  /** Optional reference tick marks along the track */
  ticks?: SliderTick[];
}

const ACCENT_COLORS = {
  ember: '#E05A1B',
  'warm-stone': '#A8967A',
} as const;

function CompactSlider({ id, label, value, displayValue, min, max, step = 1, accent, onChange, hint, range, ticks }: CompactSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = ACCENT_COLORS[accent];

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1 whitespace-nowrap">
        <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
          {label}
        </label>
        <div className="flex items-baseline gap-1.5">
          {hint && (
            <span className="text-[10px] font-medium text-stone-400">{hint}</span>
          )}
          <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
            {displayValue}
          </span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full custom-slider focus:outline-none"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e7e5e4 ${pct}%, #e7e5e4 100%)`,
          borderRadius: 2,
          ['--thumb-color' as string]: color,
        }}
      />
      <div className="relative h-3 mt-0.5 overflow-visible">
        {ticks ? ticks.map((tick) => {
          const pos = ((tick.value - min) / (max - min)) * 100;
          const align = pos <= 10 ? 'left' : pos >= 90 ? 'right' : 'center';
          const transform = align === 'left' ? 'translateX(0)' : align === 'right' ? 'translateX(-100%)' : 'translateX(-50%)';
          const tickAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';
          return (
            <div key={tick.value} className={`absolute flex flex-col ${tickAlign}`} style={{ left: `${pos}%`, transform }}>
              <div className="w-px h-1.5 bg-stone-300" />
              <span className="text-[8px] text-stone-400 whitespace-nowrap mt-px">{tick.label}</span>
            </div>
          );
        }) : range && (
          <>
            <span className="absolute left-0 text-[9px] text-stone-400">{range[0]}</span>
            <span className="absolute right-0 text-[9px] text-stone-400">{range[1]}</span>
          </>
        )}
      </div>
      <style>{`
        #${id}::-webkit-slider-thumb { background: ${color}; }
        #${id}::-moz-range-thumb { background: ${color}; }
      `}</style>
    </div>
  );
}

function dciHint(dci: number): string {
  if (dci >= 80) return 'IC-led';
  if (dci >= 60) return 'Distributed';
  if (dci >= 40) return 'Guided';
  if (dci >= 20) return 'Managed';
  return 'Top-down';
}

function cycleHint(days: number): string {
  if (days <= 1.5) return 'Rapid';
  if (days <= 3) return 'Fast';
  if (days <= 6) return 'Moderate';
  if (days <= 10) return 'Slow';
  return 'Glacial';
}

export function InputStrip() {
  const levels = useCompanyStore((s) => s.levels);
  const storeLevels = useCompanyStore((s) => s.setLevels);
  const headcount = useCompanyStore((s) => s.headcount);
  const storeHeadcount = useCompanyStore((s) => s.setHeadcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const setFidelityRate = useCompanyStore((s) => s.setFidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const setDecisionCycle = useCompanyStore((s) => s.setDecisionCycle);
  const dci = useCompanyStore((s) => s.dci);
  const setDci = useCompanyStore((s) => s.setDci);
  const teamDecisionMix = useCompanyStore((s) => s.teamDecisionMix);
  const setTeamDecisionMix = useCompanyStore((s) => s.setTeamDecisionMix);
  const contextExpanded = useCompanyStore((s) => s.contextExpanded);
  const setContextExpanded = useCompanyStore((s) => s.setContextExpanded);

  const [hcSlider, setHcSlider] = useState(() => Math.round(headcountToSlider(headcount)));
  const [preset, setPreset] = useState('custom');
  const [copied, setCopied] = useState(false);
  const [changedLevers, setChangedLevers] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHcSlider(Math.round(headcountToSlider(headcount)));
  }, [headcount]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handlePresetChange = (id: string) => {
    setPreset(id);
    if (id === 'custom') return;
    const company = REFERENCE_COMPANIES.find((c) => c.id === id);
    if (!company) return;

    // Snapshot current lever values BEFORE applying
    const prev = {
      decisionCycle: useCompanyStore.getState().decisionCycle,
      dci: useCompanyStore.getState().dci,
      teamDecisionMix: useCompanyStore.getState().teamDecisionMix,
    };

    // Apply all values immediately
    storeLevels(company.levels);
    const pos = Math.round(headcountToSlider(company.employees));
    setHcSlider(pos);
    storeHeadcount(sliderToHeadcount(pos));
    if (company.decisionCycle != null) setDecisionCycle(company.decisionCycle);
    if (company.dci != null) setDci(company.dci);
    if (company.teamDecisionMix != null) setTeamDecisionMix(company.teamDecisionMix);

    // Track which levers changed for settle animation
    const changed = new Set<string>();
    if (company.decisionCycle != null && company.decisionCycle !== prev.decisionCycle) changed.add('cycle');
    if (company.dci != null && company.dci !== prev.dci) changed.add('authority');
    if (company.teamDecisionMix != null && company.teamDecisionMix !== prev.teamDecisionMix) changed.add('team-mix');

    if (changed.size > 0) {
      setChangedLevers(changed);
      setTimeout(() => setChangedLevers(new Set()), 600);
    }
  };

  const handleLevels = (v: number) => { setPreset('custom'); storeLevels(v); };
  const handleHeadcount = (v: number) => {
    setPreset('custom');
    setHcSlider(v);
    storeHeadcount(sliderToHeadcount(v));
  };

  const formatHeadcount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);

  // Brief settle animation class — gentle scale bounce on changed levers
  const settleClass = (leverId: string) =>
    changedLevers.has(leverId) ? 'animate-[settle_0.5s_cubic-bezier(0.34,1.56,0.64,1)]' : '';

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      {/* ── Tier 1: Context Bar ── */}
      <div className="bg-stone-50 border-b border-stone-200">
        {/* Collapsed summary — entire row is clickable */}
        <button
          onClick={() => setContextExpanded(!contextExpanded)}
          className="flex items-center gap-3 px-4 py-2.5 w-full cursor-pointer hover:bg-stone-100/50 transition-colors"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Your Org</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Depth</span>
            <span className="text-sm font-extrabold font-mono tabular-nums text-stone-900">{levels}</span>
          </div>
          <div className="w-px h-3.5 bg-stone-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Headcount</span>
            <span className="text-sm font-extrabold font-mono tabular-nums text-stone-900">{formatHeadcount(headcount)}</span>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-stone-400">
            Edit
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${contextExpanded ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {/* Expanded structure sliders */}
        {contextExpanded && (
          <div className="grid grid-cols-2 gap-x-6 px-4 pb-3 pt-1">
            <CompactSlider id="is-levels" label="Depth" value={levels} displayValue={String(levels)} min={1} max={15} accent="warm-stone" onChange={handleLevels} range={['Flat', 'Deep']} />
            <CompactSlider id="is-size" label="Headcount" value={hcSlider} displayValue={formatHeadcount(headcount)} min={0} max={100} accent="warm-stone" onChange={handleHeadcount} range={['50', '500K']} />
          </div>
        )}
      </div>

      {/* ── Tier 2: Lever Sliders ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4 p-4">
        <div className={`rounded-lg ${settleClass('fidelity')}`}>
          <CompactSlider id="is-fidelity" label="Signal Clarity" value={fidelityRate} displayValue={`${fidelityRate}%`} min={50} max={98} accent="ember" onChange={(v) => { setPreset('custom'); setFidelityRate(v); }} ticks={[{ value: 70, label: 'Low trust' }, { value: 82, label: 'Typical' }, { value: 93, label: 'High trust' }]} />
        </div>
        <div className={`rounded-lg ${settleClass('cycle')}`}>
          <CompactSlider id="is-cycle" label="Decision Speed" value={decisionCycle} displayValue={`${Math.round(decisionCycle)}d`} min={1} max={14} step={0.5} accent="ember" onChange={(v) => { setPreset('custom'); setDecisionCycle(v); }} hint={cycleHint(decisionCycle)} ticks={[{ value: 1, label: 'Fast' }, { value: 4, label: 'Moderate' }, { value: 10, label: 'Slow' }]} />
        </div>
        <div className={`rounded-lg ${settleClass('authority')}`}>
          <CompactSlider id="is-dci" label="Decision Rights" value={dci} displayValue={`${dci}%`} min={0} max={100} accent="ember" onChange={(v) => { setPreset('custom'); setDci(v); }} hint={dciHint(dci)} ticks={[{ value: 20, label: 'CEO-led' }, { value: 50, label: 'Balanced' }, { value: 80, label: 'IC-led' }]} />
        </div>
        <div className={`rounded-lg ${settleClass('team-mix')}`}>
          <CompactSlider id="is-team-mix" label="Team Autonomy" value={teamDecisionMix} displayValue={`${teamDecisionMix}%`} min={0} max={100} accent="ember" onChange={(v) => { setPreset('custom'); setTeamDecisionMix(v); }} hint={teamMixHint(teamDecisionMix)} ticks={[{ value: 0, label: 'Hierarchical' }, { value: 50, label: 'Hybrid' }, { value: 100, label: 'Autonomous' }]} />
        </div>
      </div>

      {/* ── Tier 3: Benchmarks + Share ── */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-t border-stone-100">
        <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mr-1">Compare</span>
        {REFERENCE_COMPANIES.map((c) => (
          <button
            key={c.id}
            onClick={() => handlePresetChange(c.id)}
            className={`
              text-[10px] font-medium px-2.5 py-0.5 rounded-full border cursor-pointer
              transition-all duration-200
              ${preset === c.id
                ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'}
            `}
          >
            {c.name}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={handleCopyLink}
          className={`
            flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full border cursor-pointer
            transition-all duration-200
            ${copied
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'}
          `}
          title="Copy shareable link"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3" />
              Share
            </>
          )}
        </button>
      </div>
    </div>
  );
}
