import { describe, expect, it } from 'vitest';
import { createInitialState, applyAction, isWon } from '../src/core/rules';
import { starsFor } from '../src/core/scoring';
import { solveLevel } from '../src/core/solver';
import { levels, tutorialLevel } from '../src/levels';

describe('solver', () => {
  it('uses fault count before shift count and returns the optimal continuation', () => {
    const start = createInitialState(tutorialLevel);
    const first = applyAction(tutorialLevel, start, 'SHIFT_RIGHT');
    expect(solveLevel(tutorialLevel, first)).toEqual({ minFaults: 0, par: 1, actions: ['WAIT', 'SHIFT_LEFT'] });
    expect(solveLevel(tutorialLevel, { ...first, faults: 1 })?.minFaults).toBe(1);
    expect(solveLevel(tutorialLevel, { ...first, faults: 2 })).toBeNull();
  });

  it('replays a clean solution for every catalog level', () => {
    for (const level of levels) {
      const start = createInitialState(level);
      const solution = solveLevel(level, start);
      expect(solution?.minFaults, level.name).toBe(0);
      const end = solution?.actions.reduce((state, action) => applyAction(level, state, action), start);
      expect(end && isWon(level, end)).toBe(true);
      expect(end?.shifts).toBe(solution?.par);
    }
  });

  it('uses the three fault tiers and caps assisted play', () => {
    expect([starsFor(0), starsFor(1), starsFor(2), starsFor(0, true)]).toEqual([3, 2, 1, 2]);
  });
});
