import type { Company } from '../types';

export const REFERENCE_COMPANIES: Company[] = [
  // ── Flat by Design ────────────────────────────────────────────────
  {
    id: 'valve',
    name: 'Valve',
    era: '2024',
    levels: 1,
    employees: 350,
    industry: 'Gaming / Platform',
    archetype: 'flat',
    color: '#dc2626',
    notes: 'No managers. Employees choose projects. Public handbook documents the flat structure.',
    source: 'Valve Employee Handbook; industry estimates',
    narrative: 'Zero relays. Every person who spots a problem can fix it the same day.',
    decisionCycle: 1.5,
    dci: 95,   // No managers — full self-direction
  },
  {
    id: 'nucor',
    name: 'Nucor',
    era: '2024',
    levels: 4,
    employees: 32700,
    industry: 'Steel / Manufacturing',
    archetype: 'flat',
    color: '#16a34a',
    notes: '4 levels: hourly → supervisor → dept manager → VP/GM → CEO. Each division runs its own P&L.',
    narrative: 'A steelworker\'s safety concern reaches the CEO through 3 relays. Most of the signal survives.',
    source: 'SEC 10-K (2024); ResearchGate case study',
    sourceUrl: 'https://nucor.com/news-release/nucor-reports-results-for-the-fourth-quarter-and-full-year-2024-122964',
    decisionCycle: 2,
    dci: 82,   // Steel teams have full P&L authority
  },

  // ── Tech Giants ───────────────────────────────────────────────────
  {
    id: 'google',
    name: 'Google (Alphabet)',
    era: '2024',
    levels: 8,
    employees: 183323,
    industry: 'Technology',
    archetype: 'tech',
    color: '#4285F4',
    notes: 'IC levels L3-L11. ~8 management hops from IC to CEO.',
    narrative: 'An engineer\'s product insight passes through 7 managers before reaching anyone who sets strategy.',
    source: 'SEC 10-K (2024); levels.fyi',
    sourceUrl: 'https://www.levels.fyi/standard/',
    decisionCycle: 3.5,
    dci: 58,   // 20% time, IC-driven OKRs, but strong hierarchy
  },

  // ── Recently Flattened ────────────────────────────────────────────
  {
    id: 'meta-2024',
    name: 'Meta',
    era: '2024 (post-flattening)',
    levels: 6,
    employees: 74067,
    industry: 'Technology',
    archetype: 'flattened',
    color: '#3b82f6',
    notes: '2023 "Year of Efficiency" removed layers. Managers became ICs. Lean structure made permanent.',
    narrative: 'Zuckerberg cut layers in 2023 and called it permanent. Signal fidelity jumped overnight.',
    source: 'SEC 10-K (2024); Meta Year of Efficiency blog post',
    sourceUrl: 'https://about.fb.com/news/2023/03/mark-zuckerberg-meta-year-of-efficiency/',
    decisionCycle: 2.5,
    dci: 28,   // Centralized product decisions, IC execution
  },

  // ── Experimental Models ───────────────────────────────────────────
  {
    id: 'haier',
    name: 'Haier',
    era: '2024',
    levels: 3,
    employees: 75000,
    industry: 'Appliances / Manufacturing',
    archetype: 'experimental',
    color: '#7c3aed',
    notes: 'RenDanHeYi: 4,000+ micro-enterprises of ~20 people. 3 layers: platform → ME owner → entrepreneur.',
    narrative: '75,000 employees organized as 4,000 startups. Customer feedback reaches a decision-maker in hours, not months.',
    source: 'INSEAD case study; Corporate Rebels; HBR',
    sourceUrl: 'https://knowledge.insead.edu/entrepreneurship/multinational-fuelled-thousands-entrepreneurs',
    decisionCycle: 1,
    dci: 88,   // Microenterprise model — ICs run as independent units
  },

  // ── Tech Giants (deep end) ─────────────────────────────────────────
  {
    id: 'amazon',
    name: 'Amazon',
    era: '2024',
    levels: 9,
    employees: 1556000,
    industry: 'Technology / Retail',
    archetype: 'tech',
    color: '#ff9900',
    notes: 'Corporate levels L4-L12. L1-L3 are fulfillment. 9 management layers SDE to CEO.',
    narrative: 'A warehouse safety report passes through 8 relays before reaching anyone who can change policy.',
    source: 'SEC 10-K (2024); levels.fyi',
    sourceUrl: 'https://www.levels.fyi/?compare=Amazon&track=Software+Engineer',
    decisionCycle: 3,
    dci: 40,   // Two-pizza teams offset by strong top-down mandate culture
  },
];
