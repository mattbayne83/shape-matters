/**
 * Maps a fidelity percentage (0-100) to a color.
 *
 * Default (monochrome): stone-300 → stone-900. Used across the page.
 * Semantic mode: ember (low fidelity) → stone-700 (high fidelity).
 * Used in the interactive playground so users *feel* signal degradation.
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

  // Semantic: ember (0%) → stone-700 (100%)
  // ember:    hsl(19, 79%, 49%)
  // stone-700: hsl(24, 6%, 33%)
  const h = 19 + t * (24 - 19);
  const s = 79 + t * (6 - 79);
  const l = 49 + t * (33 - 49);
  return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
}

/**
 * Maps a 0-1 "goodness" score to a color on the stone-700 → ember scale.
 * 1 = best (stone-700, quiet) → 0 = worst (ember, loud).
 */
export function metricColor(goodness: number): string {
  const t = Math.max(0, Math.min(1, goodness));
  // stone-700: hsl(24, 6%, 33%)  — best (quiet)
  // ember:     hsl(19, 79%, 49%) — worst (loud)
  const h = 24 + (1 - t) * (19 - 24);
  const s = 6 + (1 - t) * (79 - 6);
  const l = 33 + (1 - t) * (49 - 33);
  return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
}
