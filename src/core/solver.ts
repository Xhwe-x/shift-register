import { applyAction, isLost } from './rules';
import { ACTIONS } from './types';
import type { Action, GameState, Level } from './types';

interface Suffix {
  readonly faults: number;
  readonly shifts: number;
  readonly action: Action | null;
}

export interface Solution {
  readonly minFaults: number;
  readonly par: number;
  readonly actions: readonly Action[];
}

function key(state: GameState): string {
  return JSON.stringify([state.beatIndex, state.crew.map((worker) => worker?.id ?? null), state.reservePtr]);
}

function better(candidate: Suffix, best: Suffix): boolean {
  return candidate.faults < best.faults ||
    (candidate.faults === best.faults && candidate.shifts < best.shifts);
}

export function solveLevel(level: Level, from: GameState): Solution | null {
  if (isLost(level, from)) return null;

  const memo = new Map<string, Suffix>();
  const transition = (state: GameState, action: Action) => applyAction(level, { ...state, faults: 0 }, action);

  function search(state: GameState): Suffix {
    if (state.beatIndex === level.beats.length) return { faults: 0, shifts: 0, action: null };
    const id = key(state);
    const known = memo.get(id);
    if (known) return known;

    let best: Suffix = { faults: Infinity, shifts: Infinity, action: null };
    for (const action of ACTIONS) {
      const next = transition(state, action);
      const tail = search(next);
      const candidate = { faults: next.faults + tail.faults, shifts: Number(action !== 'WAIT') + tail.shifts, action };
      if (better(candidate, best)) best = candidate;
    }
    memo.set(id, best);
    return best;
  }

  const suffix = search(from);
  const minFaults = from.faults + suffix.faults;
  if (minFaults > level.allowedFaults) return null;

  const actions: Action[] = [];
  let state = from;
  for (let choice = suffix; choice.action !== null; choice = search(state)) {
    actions.push(choice.action);
    state = transition(state, choice.action);
  }
  return { minFaults, par: suffix.shifts, actions };
}
