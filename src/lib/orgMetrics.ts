import type { OrgMetrics } from '../types';

/**
 * Baseline Shannon SNR corresponding to Bartlett's 82% per-hop retention.
 *
 * Derived from the Gaussian channel identity `r = SNR / (1 + SNR)` with
 * `r = 0.82`:
 *   SNR = r / (1 - r) = 0.82 / 0.18 ≈ 4.5556
 *
 * At this SNR, Shannon capacity `C = log2(1 + SNR) ≈ 2.47` bits/hop. Every
 * scenario-typed multiplier rescales this baseline — higher SNR = wider
 * channel = less per-hop decay, lower SNR = narrower channel = faster decay.
 *
 * See Cycle 12 H3 (`evals/journal/cycle-012.md`) for the full derivation.
 */
export const SHANNON_BASE_SNR = 0.82 / (1 - 0.82);

/**
 * Shannon-channel per-org fidelity under a scenario-typed SNR multiplier.
 *
 * Models the org as a cascade of `L - 1` identical Gaussian channels, each
 * with effective signal-to-noise ratio `SNR = SHANNON_BASE_SNR × multiplier`.
 * Per-hop retention is `r = SNR / (1 + SNR)`; end-to-end fidelity over the
 * chain is `r^(L-1)`.
 *
 * At `scenarioSnrMultiplier = 1.0` the function reproduces
 * `calcOrgMetrics(L, N, baseR).fidelityAtTopPct` exactly — Bartlett's 82% is
 * the operational-scenario default. Multipliers < 1 model narrower channels
 * (e.g. strategy messages with higher complexity) and produce stricter decay.
 *
 * Infrastructure for Cycle 12 H3. Callers that need the plain 82% passthrough
 * should keep using `calcOrgMetrics`; this entry point exists so the scenario
 * picker (when it lands) can compute scenario-typed fidelities consistently.
 *
 * @param levels - organizational depth L (must be ≥ 1)
 * @param scenarioSnrMultiplier - SNR scale factor for this scenario (1.0 = Bartlett baseline)
 * @param baseR - per-hop retention expressed as a percentage (default 82)
 * @returns end-to-end fidelity percentage (0-100)
 */
export function calcShannonFidelity(
  levels: number,
  scenarioSnrMultiplier: number,
  baseR: number = 82,
): number {
  if (levels <= 1) return 100;
  const r0 = baseR / 100;
  const baseSnr = r0 / (1 - r0);
  const snr = baseSnr * scenarioSnrMultiplier;
  const rScenario = snr / (1 + snr);
  return 100 * Math.pow(rScenario, levels - 1);
}

export function calcOrgMetrics(
  levels: number,
  employees: number,
  fidelityRate: number
): OrgMetrics {
  const avgSpan = Math.pow(employees, 1 / levels);
  const flatnessIndex = avgSpan / levels;
  const fidelityAtTopPct = Math.pow(fidelityRate / 100, levels - 1) * 100;
  const roundTripLayers = (levels - 1) * 2;
  const roundTripFidelity = Math.pow(fidelityRate / 100, roundTripLayers) * 100;

  const managersEstimate = Array.from({ length: levels - 1 }, (_, i) =>
    Math.round(employees / Math.pow(avgSpan, i + 1))
  ).reduce((a, b) => a + b, 0);

  const managerRatio = (managersEstimate / employees) * 100;
  const icCount = employees - managersEstimate;

  // Axios HQ reported ~$10k/employee loss on average.
  // We model this as a function of the organization's signal degradation.
  // The deeper the org, the more of that $10,140 gets wasted.
  const signalLossPct = 1 - (roundTripFidelity / 100);
  const annualCommLoss = employees * 10140 * signalLossPct;

  return {
    avgSpan,
    flatnessIndex,
    fidelityAtTopPct,
    roundTripFidelity,
    roundTripLayers,
    managersEstimate,
    managerRatio,
    icCount,
    annualCommLoss,
    levels,
    employees,
  };
}
