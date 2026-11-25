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

export function resolveBeat(
  crew: Crew, beat: Beat, beatIndex: number, absences: Level['rules']['absences'] = [],
): BeatResult {
  const matchedSlots: number[] = [];
  const faultSlots: number[] = [];
  const idleSlots: number[] = [];

  beat.forEach((skill, slot) => {
    const worker = crew[slot];
    if (skill === null) {
      idleSlots.push(slot);
    } else if (worker?.skill === skill && !absences.some((absence) =>
      absence.beat === beatIndex && absence.workerId === worker.id)) {
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

  const { crew, reservePtr } = action === 'WAIT' ? state : shiftCrew(level, state, action);

  const lastResult = resolveBeat(crew, beat, state.beatIndex, level.rules.absences);
  return {
    beatIndex: state.beatIndex + 1,
    crew,
    faults: state.faults + lastResult.faultSlots.length,
    shifts: state.shifts + Number(action !== 'WAIT'),
    reservePtr,
    lastResult,
  };
}

function shiftCrew(level: Level, state: GameState, action: Exclude<Action, 'WAIT'>): Pick<GameState, 'crew' | 'reservePtr'> {
  const { crew, reservePtr } = state;
  const { pinned, overflow, reserve } = level.rules;
  const indices = crew.flatMap((_, slot) => pinned.includes(slot) ? [] : [slot]);
  if (indices.length === 0) return { crew, reservePtr };

  const movable = indices.map((slot) => crew[slot] ?? null);
  const replacement = overflow ? reserve[reservePtr] ?? null : null;
  if (action === 'SHIFT_LEFT') {
    const outgoing = movable.shift() ?? null;
    movable.push(overflow ? replacement : outgoing);
  } else {
    const outgoing = movable.pop() ?? null;
    movable.unshift(overflow ? replacement : outgoing);
  }

  const next = [...crew];
  indices.forEach((slot, index) => {
    next[slot] = movable[index] ?? null;
  });
  return { crew: next, reservePtr: reservePtr + Number(replacement !== null) };
}
