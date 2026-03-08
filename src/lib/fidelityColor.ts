/**
 * Maps a fidelity percentage (0-100) to a color.
 *
 * Default (monochrome): stone-300 → stone-900. Used across the page.
 * Semantic mode: red → amber → green. Used in the interactive playground
 * so users *feel* signal degradation as they manipulate sliders.
 */
export function fidelityColor(pct: number, semantic?: boolean): string {
  const clamped = Math.max(0, Math.min(100, pct));
  const t = clamped / 100;

  if (!semantic) {
    // Monochrome: stone-300 (hsl 24, 6%, 83%) → stone-900 (hsl 24, 10%, 10%)
    const h = 24;
    const s = 6 + t * (10 - 6);
    const l = 83 + t * (10 - 83);
    return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
  }

  // Semantic: red (0%) → amber (50%) → green (100%)
  if (t <= 0.5) {
    const seg = t / 0.5;
    const h = 0 + seg * 38;
    const s = 72 + seg * (92 - 72);
    return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, 45%)`;
  }
  const seg = (t - 0.5) / 0.5;
  const h = 38 + seg * (142 - 38);
  const s = 92 + seg * (71 - 92);
  const l = 45 + seg * (32 - 45);
  return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
}
