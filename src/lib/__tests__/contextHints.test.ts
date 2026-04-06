import { describe, it, expect } from 'vitest';
import {
  orgSizeHint,
  fidelityHint,
  decisionCycleHint,
  culturalAgilityHint,
} from '../contextHints';

describe('orgSizeHint', () => {
  it('returns startup label for tiny orgs', () => {
    expect(orgSizeHint(80, 3.2)).toBe('Startup — everyone knows everyone');
  });

  it('includes span for small orgs', () => {
    expect(orgSizeHint(400, 5.1)).toBe('Small — ~1 manager per 5 people');
  });

  it('includes span for mid-size orgs', () => {
    expect(orgSizeHint(5000, 7.2)).toBe('Mid-size — ~1 manager per 7 people');
  });

  it('includes manager ratio for large orgs', () => {
    expect(orgSizeHint(50000, 4.5, 18.3)).toBe('Large — 18% management overhead');
  });

  it('includes manager ratio for mega-corps', () => {
    expect(orgSizeHint(200000, 3.8, 22.1)).toBe('Mega-corp — 22% management overhead');
  });
});

describe('fidelityHint', () => {
  it('returns low label', () => {
    expect(fidelityHint(60)).toBe('Low — 40% signal lost per hop');
  });

  it('returns below-average label', () => {
    expect(fidelityHint(72)).toBe('Below average — 28% signal lost per hop');
  });

  it('returns typical label', () => {
    expect(fidelityHint(82)).toBe('Typical — 18% signal lost per hop');
  });

  it('returns high label', () => {
    expect(fidelityHint(90)).toBe('High — only 10% lost per hop');
  });

  it('returns exceptional label', () => {
    expect(fidelityHint(95)).toBe('Exceptional — near-lossless relay');
  });

  // Boundary tests
  it('returns below-average at exactly 65', () => {
    expect(fidelityHint(65)).toBe('Below average — 35% signal lost per hop');
  });

  it('returns typical at exactly 80', () => {
    expect(fidelityHint(80)).toBe('Typical — 20% signal lost per hop');
  });

  it('returns typical at exactly 85', () => {
    expect(fidelityHint(85)).toBe('Typical — 15% signal lost per hop');
  });

  it('returns high at exactly 92', () => {
    expect(fidelityHint(92)).toBe('High — only 8% lost per hop');
  });
});

describe('decisionCycleHint', () => {
  it('returns startup-fast with total days', () => {
    expect(decisionCycleHint(2, 9)).toBe('Startup-fast — 16d CEO → front line');
  });

  it('returns moderate with total days', () => {
    expect(decisionCycleHint(4, 6)).toBe('Moderate — 20d CEO → front line');
  });

  it('returns bureaucratic with total days', () => {
    expect(decisionCycleHint(7, 8)).toBe('Bureaucratic — 49d CEO → front line');
  });

  it('returns glacial with total days', () => {
    expect(decisionCycleHint(12, 6)).toBe('Glacial — 60d CEO → front line');
  });

  it('returns flat hint when levels is 1', () => {
    expect(decisionCycleHint(3, 1)).toBe('Flat — no relay layers');
  });
});

describe('culturalAgilityHint', () => {
  it('returns rigid with settling weeks', () => {
    expect(culturalAgilityHint(10, 42)).toBe('Rigid — settling time ~42wk');
  });

  it('returns resistant with settling weeks', () => {
    expect(culturalAgilityHint(30, 28)).toBe('Resistant — settling time ~28wk');
  });

  it('returns moderate with settling weeks', () => {
    expect(culturalAgilityHint(55, 14)).toBe('Moderate — settling time ~14wk');
  });

  it('returns adaptive with settling weeks', () => {
    expect(culturalAgilityHint(70, 8)).toBe('Adaptive — settling time ~8wk');
  });

  it('returns highly agile with settling weeks', () => {
    expect(culturalAgilityHint(90, 4)).toBe('Highly agile — settling time ~4wk');
  });
});
