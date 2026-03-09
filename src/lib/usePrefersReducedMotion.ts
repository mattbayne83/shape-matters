import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getInitialState(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

/** Reactive hook that tracks the user's prefers-reduced-motion setting. */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialState);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
