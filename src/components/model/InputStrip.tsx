import { useEffect, useState, useCallback } from 'react';
import { Share2, Check } from 'lucide-react';
import { useCompanyStore, buildShareUrl } from '../../store/useCompanyStore';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';

const LOG_MIN = Math.log(50);
const LOG_MAX = Math.log(500_000);

function sliderToHeadcount(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / 100) * (LOG_MAX - LOG_MIN)));
}

function headcountToSlider(n: number): number {
  return ((Math.log(n) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
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
}

const ACCENT_COLORS = {
  ember: '#E05A1B',
  'warm-stone': '#A8967A',
} as const;

function CompactSlider({ id, label, value, displayValue, min, max, step = 1, accent, onChange }: CompactSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = ACCENT_COLORS[accent];

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
          {label}
        </label>
        <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
          {displayValue}
        </span>
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
          // Thumb color via CSS custom property
          ['--thumb-color' as string]: color,
        }}
      />
      <style>{`
        #${id}::-webkit-slider-thumb { background: ${color}; }
        #${id}::-moz-range-thumb { background: ${color}; }
      `}</style>
    </div>
  );
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
  const culturalAgility = useCompanyStore((s) => s.culturalAgility);
  const setCulturalAgility = useCompanyStore((s) => s.setCulturalAgility);

  const [hcSlider, setHcSlider] = useState(() => Math.round(headcountToSlider(headcount)));
  const [preset, setPreset] = useState('custom');
  const [copied, setCopied] = useState(false);

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
    storeLevels(company.levels);
    const pos = Math.round(headcountToSlider(company.employees));
    setHcSlider(pos);
    storeHeadcount(sliderToHeadcount(pos));
  };

  const handleLevels = (v: number) => { setPreset('custom'); storeLevels(v); };
  const handleHeadcount = (v: number) => {
    setPreset('custom');
    setHcSlider(v);
    storeHeadcount(sliderToHeadcount(v));
  };

  const formatHeadcount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm">
      {/* ── Row 1: Sliders ── */}
      <div className="flex items-end gap-4 p-3 px-4">
        {/* ── Structure group ── */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-x-4">
            <CompactSlider id="is-levels" label="Levels" value={levels} displayValue={String(levels)} min={1} max={15} accent="ember" onChange={handleLevels} />
            <CompactSlider id="is-size" label="Size" value={hcSlider} displayValue={formatHeadcount(headcount)} min={0} max={100} accent="ember" onChange={handleHeadcount} />
            <CompactSlider id="is-fidelity" label="Fidelity" value={fidelityRate} displayValue={`${fidelityRate}%`} min={50} max={98} accent="ember" onChange={setFidelityRate} />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="self-stretch flex items-center py-1">
          <div className="w-px h-full bg-stone-200" />
        </div>

        {/* ── Dynamics group ── */}
        <div className="flex-1 min-w-0 max-w-[280px]">
          <div className="grid grid-cols-2 gap-x-4">
            <CompactSlider id="is-cycle" label="Cycle" value={decisionCycle} displayValue={`${decisionCycle}d`} min={1} max={14} step={0.5} accent="warm-stone" onChange={setDecisionCycle} />
            <CompactSlider id="is-agility" label="Agility" value={culturalAgility} displayValue={String(culturalAgility)} min={0} max={100} accent="warm-stone" onChange={setCulturalAgility} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Presets + share ── */}
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

        {/* ── Share button ── */}
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
