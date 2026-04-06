import { describe, it, expect } from 'vitest';
import { applyRelayTransforms, truncateRelayLevels } from '../signalRelay';
import type { RelayLevel } from '../../types';

describe('applyRelayTransforms', () => {
  describe('number stripping (L1-L2)', () => {
    it('replaces dollar amounts with "significant amount"', () => {
      const result = applyRelayTransforms('We lost $2.3M in revenue', 1);
      expect(result).not.toContain('$2.3M');
      expect(result).toContain('significant amount');
    });

    it('replaces measurements with vague quantifiers', () => {
      const result = applyRelayTransforms('Pressure at 180 PSI exceeded limit', 1);
      expect(result).not.toContain('180');
    });

    it('replaces percentages with qualitative terms', () => {
      const result = applyRelayTransforms('Throughput dropped 42% this week', 1);
      expect(result).not.toContain('42%');
    });
  });

  describe('name/location genericizing (L1-L2)', () => {
    it('replaces capitalized proper nouns with generic terms', () => {
      const result = applyRelayTransforms('Sarah discovered the issue on Line 12', 2);
      expect(result).not.toContain('Sarah');
      expect(result).not.toContain('Line 12');
    });
  });

  describe('urgency softening (L3-L5)', () => {
    it('softens "critical" to "potential"', () => {
      const result = applyRelayTransforms('This is a critical failure', 3);
      expect(result).not.toContain('critical');
      expect(result.toLowerCase()).toContain('potential');
    });

    it('softens "immediately" to "when possible"', () => {
      const result = applyRelayTransforms('We need to act immediately', 3);
      expect(result).not.toContain('immediately');
      expect(result).toContain('when possible');
    });
  });

  describe('passive voice injection (L3-L5)', () => {
    it('replaces "I discovered" with passive form', () => {
      const result = applyRelayTransforms('I discovered a leak in the system', 4);
      expect(result).not.toContain('I discovered');
      expect(result.toLowerCase()).toContain('it was noted');
    });
  });

  describe('ownership dilution (L6+)', () => {
    it('replaces individual names with collective attribution', () => {
      const result = applyRelayTransforms('The team identified a risk', 6);
      expect(result).not.toContain('team identified');
    });
  });

  describe('action → observation (L6+)', () => {
    it('converts "we should" recommendations to status reports', () => {
      const result = applyRelayTransforms('We should switch vendors immediately', 7);
      expect(result).not.toContain('should');
    });
  });

  describe('cumulative application', () => {
    it('applies more rules at higher levels', () => {
      const msg = 'Sarah found a critical failure at Line 12, pressure at 180 PSI. We should fix it immediately.';
      const l2 = applyRelayTransforms(msg, 2);
      const l5 = applyRelayTransforms(msg, 5);
      const l7 = applyRelayTransforms(msg, 7);

      // Higher levels should produce shorter/vaguer messages
      expect(l5.length).toBeLessThanOrEqual(l2.length);
      expect(l7.length).toBeLessThanOrEqual(l5.length);
    });

    it('returns original for level 0', () => {
      const msg = 'Exact original message';
      expect(applyRelayTransforms(msg, 0)).toBe(msg);
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(applyRelayTransforms('', 5)).toBe('');
    });

    it('handles message with no transformable content', () => {
      const msg = 'Things are going well today';
      const result = applyRelayTransforms(msg, 2);
      expect(result).toBeTruthy();
    });
  });
});

describe('truncateRelayLevels', () => {
  const levels: RelayLevel[] = Array.from({ length: 8 }, (_, i) => ({
    role: `Role ${i}`,
    message: `Message at level ${i}`,
    incentive: `Incentive ${i}`,
    lostDetails: [`detail-${i}`],
    addedFraming: [`framing-${i}`],
  }));

  it('returns all 8 levels when slider is 9 (8 relays = 9 org levels)', () => {
    const result = truncateRelayLevels(levels, 9);
    expect(result).toHaveLength(8);
  });

  it('returns first N-1 levels for slider value N < 9', () => {
    const result = truncateRelayLevels(levels, 4);
    expect(result).toHaveLength(3);
    expect(result[0].role).toBe('Role 0');
    expect(result[1].role).toBe('Role 1');
    expect(result[2].role).toBe('Role 2');
  });

  it('returns 1 level for slider value 2 (minimum relay)', () => {
    const result = truncateRelayLevels(levels, 2);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('Role 0');
  });

  it('returns empty array for slider value 1 (flat org, no relays)', () => {
    const result = truncateRelayLevels(levels, 1);
    expect(result).toHaveLength(0);
  });

  it('caps at source array length', () => {
    const result = truncateRelayLevels(levels, 15);
    expect(result).toHaveLength(8);
  });
});

import { SCENARIOS } from '../../data/scenarios';

describe('scenario data integrity', () => {
  it('has exactly 5 scenarios', () => {
    expect(SCENARIOS).toHaveLength(5);
  });

  it('covers all 5 categories', () => {
    const categories = new Set(SCENARIOS.map((s) => s.category));
    expect(categories).toEqual(new Set(['safety', 'strategy', 'customer', 'innovation', 'operations']));
  });

  it('each scenario has exactly 8 relay levels', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.levels).toHaveLength(8);
    }
  });

  it('each relay level has all required fields', () => {
    for (const scenario of SCENARIOS) {
      for (const level of scenario.levels) {
        expect(level.role).toBeTruthy();
        expect(level.message).toBeTruthy();
        expect(level.incentive).toBeTruthy();
        expect(Array.isArray(level.lostDetails)).toBe(true);
        expect(Array.isArray(level.addedFraming)).toBe(true);
      }
    }
  });

  it('messages get shorter or equal at each successive level', () => {
    for (const scenario of SCENARIOS) {
      for (let i = 1; i < scenario.levels.length; i++) {
        expect(scenario.levels[i].message.length).toBeLessThanOrEqual(
          scenario.levels[i - 1].message.length * 1.3
        );
      }
    }
  });
});
