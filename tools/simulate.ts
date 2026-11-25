import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { isLost, isWon } from '../src/core/rules';
import { ShiftSession } from '../src/core/session';
import type { Action } from '../src/core/types';
import { tutorialLevel } from '../src/levels';

const commands = new Map<string, Action>([
  ['l', 'SHIFT_LEFT'],
  ['r', 'SHIFT_RIGHT'],
  ['w', 'WAIT'],
]);
const session = new ShiftSession(tutorialLevel);

function printState(): void {
  const { state, level } = session;
  const beat = level.beats[state.beatIndex];

  if (state.lastResult) {
    const stations = state.lastResult.faultSlots.map((slot) => slot + 1);
    console.log(stations.length ? 'Faults at stations ' + stations.join(', ') : 'Previous beat clear.');
  }

  console.log('Crew       | ' + state.crew.map((worker) => worker?.skill ?? '–').join(' | '));
  if (beat && !isLost(level, state)) {
    console.log('Demand     | ' + beat.map((skill) => skill ?? '–').join(' | '));
    console.log('Beat ' + (state.beatIndex + 1) + '/' + level.beats.length);
  }
  console.log('Faults ' + state.faults + '/' + level.allowedFaults + '  •  Shifts ' + state.shifts);
  if (isWon(level, state)) console.log('Shift complete.');
  if (isLost(level, state)) console.log('Shift failed.');
}

function run(command: string): boolean {
  const key = command.trim().toLowerCase();
  const action = commands.get(key);
  if (action) session.act(action);
  else if (key === 'z') session.undo();
  else if (key === 'restart') session.restart();
  else return false;
  printState();
  return true;
}

console.log('Shift Register / ' + tutorialLevel.name);
printState();
const args = process.argv.slice(2);

if (args.length > 0) {
  for (const command of args) {
    if (!run(command)) {
      console.error('Unknown command: ' + command);
      process.exitCode = 2;
      break;
    }
  }
  if (!process.exitCode && !isWon(tutorialLevel, session.state)) process.exitCode = 1;
} else {
  const prompt = createInterface({
    input: stdin,
    output: stdout,
    prompt: 'Left [l], right [r], wait [w], undo [z], restart, quit [q] > ',
  });
  try {
    prompt.prompt();
    for await (const command of prompt) {
      if (command.trim().toLowerCase() === 'q') break;
      if (!run(command)) console.log('Choose l, r, w, z, restart, or q.');
      prompt.prompt();
    }
  } finally {
    prompt.close();
  }
}
