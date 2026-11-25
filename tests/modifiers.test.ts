import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState } from '../src/core/rules';
import type { Level } from '../src/core/types';
import { tutorialLevel } from '../src/levels';

const rules = tutorialLevel.rules;
const level: Level = {
  ...tutorialLevel,
  beats: [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, 'eye'],
  ],
  rules: { ...rules, pinned: [0, 2], overflow: true, reserve: [{ id: 'r1', skill: 'eye' }] },
};

describe('rule modifiers', () => {
  it('cycles just the ordered unpinned slots when pinned workers are interleaved', () => {
    const pinned = { ...level, rules: { ...rules, pinned: [0, 2] } };
    const state = applyAction(pinned, createInitialState(pinned), 'SHIFT_LEFT');
    expect(state.crew.map((w) => w?.id)).toEqual(['w1', 'w4', 'w3', 'w5', 'w2']);
    expect(state.reservePtr).toBe(0);
  });

  it('ejects and replenishes across unpinned slots, then leaves an empty slot', () => {
    const right = applyAction(level, createInitialState(level), 'SHIFT_RIGHT');
    expect(right.crew.map((w) => w?.id ?? null)).toEqual(['w1', 'r1', 'w3', 'w2', 'w4']);
    const wait = applyAction(level, right, 'WAIT');
    expect(wait.reservePtr).toBe(1);
    const left = applyAction(level, wait, 'SHIFT_LEFT');
    expect(left.crew.map((w) => w?.id ?? null)).toEqual(['w1', 'w2', 'w3', 'w4', null]);
    expect(left.reservePtr).toBe(1);
    expect(left.lastResult?.faultSlots).toEqual([4]);
  });

  it('treats an absent replacement as unskilled on its listed beat only', () => {
    const leave: Level = {
      ...level,
      beats: [[null, 'eye', null, null, null], [null, 'eye', null, null, null]],
      rules: { ...level.rules, absences: [{ beat: 0, workerId: 'r1' }] },
    };
    const right = applyAction(leave, createInitialState(leave), 'SHIFT_RIGHT');
    expect(right.lastResult?.faultSlots).toEqual([1]);
    const wait = applyAction(leave, right, 'WAIT');
    expect(wait.lastResult?.matchedSlots).toEqual([1]);
  });

  it('does not use a reserve worker if every station is pinned', () => {
    const fixed = { ...level, rules: { ...level.rules, pinned: [0, 1, 2, 3, 4] } };
    const start = createInitialState(fixed);
    const right = applyAction(fixed, start, 'SHIFT_RIGHT');
    expect(right.crew).toBe(start.crew);
    expect(right.reservePtr).toBe(0);
    expect(right.beatIndex).toBe(1);
  });
});
