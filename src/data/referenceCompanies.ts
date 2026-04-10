import type { Company } from '../types';

// DCI (Decision-Centrality Index, 0-100) and teamDecisionMix (0-100) assignments
// are grounded in Cycle 5 H5 research (evals/journal/cycle-005.md).
//
// H5 recommendations — current values — basis for deviation:
//   Valve    92  → 92   (no deviation; Jeri Ellsworth + Puranam evidence)
//   Haier    88  → 88   (no deviation; Humanocracy + HBS cases)
//   Google   58  → 58   (no deviation; post-2020 bureaucratic drift)
//   Amazon   75  → 72   (−3; modest downward adjustment — strategic centralization)
//   Nucor    72  → 82   (+10; Iverson's "Plain Talk" + plant GM full P&L authority
//                         justify stronger signal than the H5 lower bound)
//   Meta     18  → 28   (+10; engineering ICs retain meaningful technical autonomy
//                         below the Zuckerberg-centralized strategic layer)
//
// teamDecisionMix values derive from Cycle 5 H3 Table ("estimated team structures"):
// the fraction of decisions resolved at two-pizza-team depth rather than traversing
// the full hierarchy. Amazon=70 and Haier=80 match H3 directly; others interpolated
// from archetype.

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
    dci: 92,   // Near-full self-direction; informal hierarchies temper ideology
    dciSource: 'case-study',
    teamDecisionMix: 0, // Flat — no hierarchy to route around
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
    dciSource: 'case-study',
    teamDecisionMix: 60, // Plant-level P&L authority
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
    dciSource: 'qualitative-estimate',
    teamDecisionMix: 50, // Mixed team/escalation
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
    dciSource: 'qualitative-estimate',
    teamDecisionMix: 30, // Centralized culture
  },

  // ── Self-Managing Models ──────────────────────────────────────────
  {
    id: 'haier',
    name: 'Haier',
    era: '2024',
    levels: 3,
    employees: 75000,
    industry: 'Appliances / Manufacturing',
    archetype: 'self-managing',
    color: '#7c3aed',
    notes: 'RenDanHeYi: 4,000+ micro-enterprises of ~20 people. 3 layers: platform → ME owner → entrepreneur.',
    narrative: '75,000 employees organized as 4,000 startups. Customer feedback reaches a decision-maker in hours, not months.',
    source: 'INSEAD case study; Corporate Rebels; HBR',
    sourceUrl: 'https://knowledge.insead.edu/entrepreneurship/multinational-fuelled-thousands-entrepreneurs',
    decisionCycle: 1,
    dci: 88,   // Microenterprise model — ICs run as independent units
    dciSource: 'case-study',
    teamDecisionMix: 80, // Microenterprise model
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
    dci: 72,   // Two-pizza team autonomy is defining feature (Bryar & Carr); strategic centralization caps it
    dciSource: 'qualitative-estimate',
    teamDecisionMix: 70, // Two-pizza teams (Bryar & Carr)
  },

  // ── Self-Managing (added 2026-04-10 after agent-led research) ─────
  {
    id: 'morning-star',
    name: 'Morning Star',
    era: '2024',
    levels: 1,
    employees: 550,
    industry: 'Food Processing (Tomato)',
    archetype: 'flat',
    color: '#dc2626',
    notes: '23 self-managing business units, no managers, no titles. Coordination via annually-negotiated Colleague Letters of Understanding (CLOUs) with peers. World\'s largest tomato processor.',
    narrative: '400 colleagues, zero bosses. Every commitment is peer-to-peer via a one-page Letter of Understanding. Tomato paste has been flowing this way since 1990.',
    source: 'Hamel, "First, Let\'s Fire All the Managers" (HBR Dec 2011); HBS case 914-013 "The Morning Star Company: Self-Management at Work"; Kirkpatrick, Beyond Empowerment',
    sourceUrl: 'https://hbr.org/2011/12/first-lets-fire-all-the-managers',
    decisionCycle: 1,
    dci: 90,   // CLOUs + committee dispute resolution; slightly below Valve due to formal process
    dciSource: 'case-study',
    teamDecisionMix: 75,
  },
  {
    id: 'buurtzorg',
    name: 'Buurtzorg',
    era: '2024',
    levels: 2,
    employees: 14000,
    industry: 'Healthcare (Home Nursing)',
    archetype: 'self-managing',
    color: '#059669',
    notes: 'Dutch home-nursing self-managing teams of up to 12 nurses. 900+ teams, 21 coaches (non-managerial), 2 directors, ~50 back-office staff. Growth by cell division when caseload exceeds 12.',
    narrative: '14,000 nurses, 900 teams, zero middle managers. A back office of 50 and 21 coaches for the entire country. Patient outcomes improved, admin overhead collapsed.',
    source: 'Kreutzer et al., "Buurtzorg: scaling up an organization with hundreds of self-managing teams but no middle managers" (Journal of Organization Design 2024); Laloux, Reinventing Organizations (2014)',
    sourceUrl: 'https://link.springer.com/article/10.1007/s41469-024-00184-y',
    decisionCycle: 1,
    dci: 85,   // Teams have scheduling/hiring/care-plan autonomy; slightly below Haier (no P&L ownership)
    dciSource: 'case-study',
    teamDecisionMix: 85,
  },
  {
    id: 'berkshire-hathaway',
    name: 'Berkshire Hathaway',
    era: '2024',
    levels: 4,
    employees: 392400,
    industry: 'Conglomerate Holding',
    archetype: 'self-managing',
    color: '#0ea5e9',
    notes: 'HQ has 27 employees. Subsidiary CEOs report to Buffett/Abel. Level count is HQ-only — subsidiary internals (BNSF, GEICO) each run their own hierarchies. Munger: "delegation just short of abdication."',
    narrative: '$900B in assets, 390,000 employees, and 27 people at headquarters. Subsidiary CEOs send cash up and get out of jail free on everything else.',
    source: 'Cunningham & Cuba, Margin of Trust: The Berkshire Business Model (Columbia Business School Publishing 2020); Stanford GSB case "The Management of Berkshire Hathaway"; Berkshire 2024 Annual Report',
    sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/management-berkshire-hathaway',
    decisionCycle: 2,
    dci: 75,   // High at subsidiary-CEO level; not measuring IC experience inside subsidiaries
    dciSource: 'case-study',
    teamDecisionMix: 60,
  },

  // ── Command (added 2026-04-10: bureaucratic counterweights) ───────
  // "Command" = deep hierarchy with centralized objective-setting, standardized
  // processes, narrow frontline discretion on anything beyond task execution.
  // Operational descriptor, not pejorative.
  {
    id: 'ge-welch',
    name: 'GE (Welch era)',
    era: '1990-2001',
    levels: 10,
    employees: 313000,
    industry: 'Industrial Conglomerate',
    archetype: 'command',
    color: '#1e3a8a',
    notes: 'Welch\'s "boundaryless" rhetoric aside, operational reality was centralized objective-setting via Session C reviews and the 20-70-10 stack ranking. Work-Out gave frontline voice but not authority.',
    narrative: 'Welch\'s "boundaryless" GE ran on stack ranking and quarterly numbers — frontline discretion was narrower than the rhetoric.',
    source: 'Gelles, The Man Who Broke Capitalism (2022); Tichy & Sherman, Control Your Destiny or Someone Else Will (1993); Welch, Straight from the Gut (2001); HBS case 9-399-150',
    sourceUrl: 'https://www.hbs.edu/faculty/Pages/item.aspx?num=26319',
    decisionCycle: 4,
    dci: 35,
    dciSource: 'case-study',
    teamDecisionMix: 20,
  },
  {
    id: 'ibm-pre-gerstner',
    name: 'IBM (pre-Gerstner)',
    era: '1990-1993',
    levels: 11,
    employees: 374000,
    industry: 'Computer Hardware & Systems',
    archetype: 'command',
    color: '#1e40af',
    notes: '"Non-concur" culture: any senior manager in the 6-8 layer signoff chain could veto a product decision. Gerstner killed the system as his first act in 1993. Product decisions took 12-18 months.',
    narrative: 'IBM\'s "non-concur" culture turned every cross-team decision into a 6-signature consensus hunt — the definitional case of depth tax.',
    source: 'Gerstner, Who Says Elephants Can\'t Dance? (HarperBusiness 2002); Carroll, Big Blues: The Unmaking of IBM (1993); HBS case 9-699-043',
    sourceUrl: 'https://www.hbs.edu/faculty/Pages/item.aspx?num=25874',
    decisionCycle: 5,
    dci: 30,
    dciSource: 'case-study',
    teamDecisionMix: 15,
  },
  {
    id: 'walmart',
    name: 'Walmart',
    era: '2020-2024',
    levels: 8,
    employees: 2100000,
    industry: 'Mass Retail',
    archetype: 'command',
    color: '#0284c7',
    notes: 'Bentonville merchandising is one of the most centralized in retail. Store managers have near-zero SKU, pricing, or planogram authority. Wages and scheduling are centrally set.',
    narrative: 'Walmart runs 4,600 US stores on a centralized merchandising spine — store teams execute the plan, they don\'t shape it.',
    source: 'Fishman, The Wal-Mart Effect (2006); Lichtenstein, The Retail Revolution (2009); Walmart 10-K filings',
    sourceUrl: 'https://corporate.walmart.com/about',
    decisionCycle: 3,
    dci: 30,
    dciSource: 'case-study',
    teamDecisionMix: 20,
  },
  {
    id: 'usps',
    name: 'USPS',
    era: '2020-2024',
    levels: 10,
    employees: 635000,
    industry: 'Government Logistics',
    archetype: 'command',
    color: '#1e293b',
    notes: 'Four major unions codify task-level routines. Statutory rate-setting via Postal Regulatory Commission. GAO reports cite 12-24 month feedback loops on operational changes.',
    narrative: 'USPS runs on collective-bargaining-codified routines and 10 layers of review — local offices execute national directives.',
    source: 'GAO-20-385 "U.S. Postal Service: Financial Viability"; GAO-23-106073 on USPS network redesign; USPS Annual Report to Congress',
    sourceUrl: 'https://www.gao.gov/products/gao-20-385',
    decisionCycle: 5,
    dci: 25,
    dciSource: 'case-study',
    teamDecisionMix: 15,
  },
  {
    id: 'us-va-vha',
    name: 'VA Health Administration',
    era: '2015-2024',
    levels: 10,
    employees: 371000,
    industry: 'Government Healthcare',
    archetype: 'command',
    color: '#334155',
    notes: 'Clinicians have professional discretion inside the exam room; hiring, scheduling, pay, capital, and cross-site coordination are centrally controlled. The 2014 Phoenix wait-time scandal was a depth-tax failure.',
    narrative: 'VHA clinicians have professional discretion inside the exam room; almost nothing else is local — the 2014 wait-time scandal was a depth-tax failure.',
    source: 'GAO-15-536T "VA Health Care: Management and Oversight"; GAO-19-462; Shulkin, It Shouldn\'t Be This Hard to Serve Your Country (2019)',
    sourceUrl: 'https://www.gao.gov/products/gao-15-536t',
    decisionCycle: 4,
    dci: 30,
    dciSource: 'case-study',
    teamDecisionMix: 25,
  },
  {
    id: 'ford-pre-mulally',
    name: 'Ford (pre-Mulally)',
    era: '2001-2006',
    levels: 11,
    employees: 328000,
    industry: 'Automotive Manufacturing',
    archetype: 'command',
    color: '#164e63',
    notes: 'Classic functional-plus-regional matrix with brand/regional "fiefdoms" — Mulally\'s first move was a single weekly BPR meeting forcing cross-silo visibility. 4-6 year vehicle program cycles were decision-latency driven.',
    narrative: 'Pre-Mulally Ford was a federation of feuding regional and brand fiefdoms — Mulally\'s first move was forcing them into one weekly meeting.',
    source: 'Hoffman, American Icon: Alan Mulally and the Fight to Save Ford Motor Company (Crown Business 2012); Bloom & Van Reenen, "Measuring and Explaining Management Practices Across Firms and Countries" (QJE 2007)',
    sourceUrl: 'https://academic.oup.com/qje/article/122/4/1351/1850493',
    decisionCycle: 4,
    // wms-sector anchor: Bloom–Van Reenen US auto manufacturing WMS mean ≈ 3.3 → DCI ≈ 57,
    // adjusted down ~17pts based on Hoffman's documentation of pre-Mulally fiefdoms
    dci: 40,
    dciSource: 'wms-sector',
    teamDecisionMix: 30,
  },
];
