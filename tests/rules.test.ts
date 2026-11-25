import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, isLost, isWon, resolveBeat } from '../src/core/rules';
import { ShiftSession } from '../src/core/session';
import type { Level } from '../src/core/types';
import { tutorialLevel } from '../src/levels';

describe('turn rules', () => {
  it('rotates in either direction without mutating the earlier state', () => {
    const start = createInitialState(tutorialLevel);
    const left = applyAction(tutorialLevel, start, 'SHIFT_LEFT');
    const right = applyAction(tutorialLevel, start, 'SHIFT_RIGHT');

    expect(left.crew.map((worker) => worker?.id)).toEqual(['w2', 'w3', 'w4', 'w5', 'w1']);
    expect(right.crew.map((worker) => worker?.id)).toEqual(['w5', 'w1', 'w2', 'w3', 'w4']);
    expect(start.crew).toEqual(tutorialLevel.workers);
    expect(right.lastResult?.matchedSlots).toEqual([0, 1]);
    expect(right.shifts).toBe(1);
  });

  it('counts matches, idle stations, out-of-place workers, and empty occupied-demand slots', () => {
    const result = resolveBeat(
      [{ id: 'w1', skill: 'wrench' }, null, { id: 'w2', skill: 'eye' }, null],
      ['wrench', 'eye', 'muscle', null],
      4,
    );
    expect(result).toEqual({ beatIndex: 4, matchedSlots: [0], faultSlots: [1, 2], idleSlots: [3] });
  });

  it('allows waiting without adding a shift, and wins the tutorial in two shifts', () => {
    const start = createInitialState(tutorialLevel);
    const right = applyAction(tutorialLevel, start, 'SHIFT_RIGHT');
    const wait = applyAction(tutorialLevel, right, 'WAIT');
    const end = applyAction(tutorialLevel, wait, 'SHIFT_LEFT');

    expect(wait.crew).toBe(right.crew);
    expect(wait.beatIndex).toBe(2);
    expect(end).toMatchObject({ beatIndex: 3, faults: 0, shifts: 2 });
    expect(isWon(tutorialLevel, end)).toBe(true);
    expect(applyAction(tutorialLevel, end, 'SHIFT_LEFT')).toBe(end);
  });

  it('allows the exact fault limit, but a fault over the limit takes precedence on the final beat', () => {
    const level: Level = {
      ...tutorialLevel,
      beats: [
        [null, 'eye', null, null, null],
        ['eye', null, null, null, null],
      ],
    };
    const start = createInitialState(level);
    const atLimit = applyAction(level, start, 'WAIT');
    const win = applyAction(level, atLimit, 'SHIFT_RIGHT');
    const fail = applyAction(level, atLimit, 'WAIT');

    expect(atLimit.faults).toBe(1);
    expect(isLost(level, atLimit)).toBe(false);
    expect(isWon(level, win)).toBe(true);
    expect(isLost(level, fail)).toBe(true);
    expect(isWon(level, fail)).toBe(false);
    expect(applyAction(level, fail, 'SHIFT_RIGHT')).toBe(fail);
  });

  it('stops immediately after a failed beat', () => {
    const fail = applyAction(tutorialLevel, createInitialState(tutorialLevel), 'WAIT');
    expect(fail.faults).toBe(2);
    expect(isLost(tutorialLevel, fail)).toBe(true);
    expect(applyAction(tutorialLevel, fail, 'SHIFT_RIGHT')).toBe(fail);
  });
});

describe('undo and restart', () => {
  it('undoes a loss all the way to the initial state', () => {
    const session = new ShiftSession(tutorialLevel);
    const start = session.state;
    session.act('SHIFT_RIGHT');
    session.act('SHIFT_RIGHT');
    expect(isLost(tutorialLevel, session.state)).toBe(true);
    session.act('SHIFT_RIGHT');
    session.undo();
    expect(session.state).toMatchObject({ beatIndex: 1, faults: 0, shifts: 1 });
    session.undo();
    session.undo();
    expect(session.state).toBe(start);
    expect(session.canUndo).toBe(false);
  });

  it('clears history and resets the crew on restart', () => {
    const session = new ShiftSession(tutorialLevel);
    session.act('SHIFT_RIGHT');
    session.restart();
    expect(session.state).toEqual(createInitialState(tutorialLevel));
    expect(session.canUndo).toBe(false);
  });

  it('keeps the hint cap across undo and clears it on restart', () => {
    const session = new ShiftSession(tutorialLevel);
    session.act('SHIFT_RIGHT');
    session.useHint();
    session.undo();
    expect(session.usedHint).toBe(true);
    session.restart();
    expect(session.usedHint).toBe(false);
  });
});
