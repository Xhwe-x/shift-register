import type { Action, Beat, BeatResult, Crew, GameState, Level } from './types';

export function createInitialState(level: Level): GameState {
  return {
    beatIndex: 0,
    crew: [...level.workers],
    faults: 0,
    shifts: 0,
    reservePtr: 0,
    lastResult: null,
  };
}

export function resolveBeat(crew: Crew, beat: Beat, beatIndex: number): BeatResult {
  const matchedSlots: number[] = [];
  const faultSlots: number[] = [];
  const idleSlots: number[] = [];

  beat.forEach((skill, slot) => {
    if (skill === null) {
      idleSlots.push(slot);
    } else if (crew[slot]?.skill === skill) {
      matchedSlots.push(slot);
    } else {
      faultSlots.push(slot);
    }
  });

  return { beatIndex, matchedSlots, faultSlots, idleSlots };
}

export function isLost(level: Level, state: GameState): boolean {
  return state.faults > level.allowedFaults;
}

export function isWon(level: Level, state: GameState): boolean {
  return state.beatIndex === level.beats.length && !isLost(level, state);
}

export function applyAction(level: Level, state: GameState, action: Action): GameState {
  const beat = level.beats[state.beatIndex];
  if (!beat || isLost(level, state)) return state;

  const nextCrew = action === 'WAIT' ? state.crew : rotate(level, state.crew, action);

  const lastResult = resolveBeat(nextCrew, beat, state.beatIndex);
  return {
    beatIndex: state.beatIndex + 1,
    crew: nextCrew,
    faults: state.faults + lastResult.faultSlots.length,
    shifts: state.shifts + Number(action !== 'WAIT'),
    reservePtr: state.reservePtr,
    lastResult,
  };
}

function rotate(level: Level, crew: Crew, action: Exclude<Action, 'WAIT'>): Crew {
  const indices = crew.flatMap((_, slot) => level.rules.pinned.includes(slot) ? [] : [slot]);
  const movable = indices.map((slot) => crew[slot] ?? null);
  const next = [...crew];
  const delta = action === 'SHIFT_LEFT' ? 1 : -1;
  indices.forEach((slot, index) => {
    next[slot] = movable[(index + delta + movable.length) % movable.length] ?? null;
  });
  return next;
}
