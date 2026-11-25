import type { Action, Beat, BeatResult, Crew, GameState, Level } from './types';

export function createInitialState(level: Level): GameState {
  return {
    beatIndex: 0,
    crew: [...level.workers],
    faults: 0,
    shifts: 0,
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

  const { crew } = state;
  let nextCrew = crew;
  if (action === 'SHIFT_LEFT') {
    nextCrew = [...crew.slice(1), crew[0] ?? null];
  } else if (action === 'SHIFT_RIGHT') {
    nextCrew = [crew.at(-1) ?? null, ...crew.slice(0, -1)];
  }

  const lastResult = resolveBeat(nextCrew, beat, state.beatIndex);
  return {
    beatIndex: state.beatIndex + 1,
    crew: nextCrew,
    faults: state.faults + lastResult.faultSlots.length,
    shifts: state.shifts + Number(action !== 'WAIT'),
    lastResult,
  };
}
