import { applyAction, createInitialState, isWon } from '../src/core/rules';
import { solveLevel } from '../src/core/solver';
import type { Action, Level } from '../src/core/types';
import { levels } from '../src/levels';

function repeat(level: Level, action: Action) {
  return level.beats.reduce((state) => applyAction(level, state, action), createInitialState(level));
}

if (levels.length !== 10 || levels.some((level, index) => level.id !== index + 1)) {
  console.error('Catalog must contain all ten levels in order.');
  process.exitCode = 1;
}

for (const level of levels) {
  const solution = solveLevel(level, createInitialState(level));
  const failures: string[] = [];
  if (!solution) failures.push('unsolvable');
  else if (solution.minFaults !== 0) failures.push('no zero-fault win');

  if (isWon(level, repeat(level, 'WAIT'))) failures.push('all WAIT wins');
  if (level.id > 1) {
    for (const action of ['SHIFT_LEFT', 'SHIFT_RIGHT'] as const) {
      const end = repeat(level, action);
      if (isWon(level, end) && end.faults === 0) failures.push('all ' + action + ' wins with zero faults');
    }
    if (solution && solution.par < 2) failures.push('par below 2');
  }

  const name = String(level.id).padStart(2, '0') + ' · ' + level.name;
  if (failures.length) {
    console.error(name + ' — ' + failures.join('; '));
    process.exitCode = 1;
  } else if (solution) {
    console.log(name + ' — ' + solution.minFaults + ' faults, par ' + solution.par +
      ' · ' + solution.actions.map((action) => action === 'WAIT' ? 'W' : action === 'SHIFT_LEFT' ? 'L' : 'R').join(' '));
  }
}
