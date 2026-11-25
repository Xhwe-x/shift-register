import { createInitialState, isWon } from '../../core/rules';
import { starsFor } from '../../core/scoring';
import type { ShiftSession } from '../../core/session';
import { solveLevel } from '../../core/solver';
import { levels } from '../../levels';
import { node, ScreenScene } from './screens';

export class ResultScene extends ScreenScene {
  constructor() { super('Result'); }

  create({ session }: { session: ShiftSession }): void {
    const screen = this.open();
    const { level, state } = session;
    const won = isWon(level, state);
    const stars = starsFor(state.faults, session.usedHint);
    const par = solveLevel(level, createInitialState(level))?.par;

    node(screen, 'p', level.name.toUpperCase(), 'machine-label');
    node(screen, 'h2', won ? 'Shift complete' : 'Shift failed');
    if (won) node(screen, 'p', stars + ' / 3 stars', 'report-stars');
    node(screen, 'p', state.faults + ' faults  ·  ' + state.shifts + ' shifts  ·  Par ' + (par ?? '—'), 'screen-intro');

    const actions = node(screen, 'div', undefined, 'screen-actions');
    const next = levels.find((candidate) => candidate.id === level.id + 1);
    if (won && next) this.button(actions, 'Next shift', () => this.scene.start('Play', { level: next }), true);
    this.button(actions, 'Retry', () => this.scene.start('Play', { level }), !won);
    this.button(actions, 'Undo last beat', () => {
      session.undo();
      this.scene.start('Play', { session });
    });
    this.button(actions, 'Choose a shift', () => this.scene.start('LevelSelect'));
  }
}
