import { createInitialState, isWon } from '../../core/rules';
import { starsFor } from '../../core/scoring';
import type { ShiftSession } from '../../core/session';
import { solveLevel } from '../../core/solver';
import { levels } from '../../levels';
import { format, levelText, words } from '../../i18n';
import { bindKeyboard } from '../input';
import { node, ScreenScene } from './screens';

export class ResultScene extends ScreenScene {
  constructor() { super('Result'); }

  create({ session }: { session: ShiftSession }): void {
    const screen = this.open();
    const { level, state } = session;
    const t = words();
    const won = isWon(level, state);
    const stars = starsFor(state.faults, session.usedHint);
    const par = solveLevel(level, createInitialState(level))?.par;

    const title = levelText(level);
    const card = node(screen, 'article', undefined, 'timecard');
    card.dataset.outcome = won ? 'won' : 'lost';
    node(card, 'p', t.timecard + ' / ' + String(level.id).padStart(2, '0') + ' · ' + title.name, 'machine-label');
    this.heading(card, won ? t.won : t.lost);
    if (won) {
      const rating = node(card, 'p', undefined, 'report-stars');
      const marks = node(rating, 'span', '★'.repeat(stars) + '☆'.repeat(3 - stars));
      marks.setAttribute('aria-hidden', 'true');
      node(rating, 'span', format(t.cleared, { value: stars }), 'sr-only');
    }
    const stats = node(card, 'dl', undefined, 'timecard-stats');
    for (const [label, value] of [[t.reportFaults, state.faults], [t.reportMoves, state.shifts], [t.reportPar, par ?? '—']]) {
      const field = node(stats, 'div');
      node(field, 'dt', String(label));
      node(field, 'dd', String(value));
    }
    if (won && par !== undefined) {
      const delta = state.shifts - par;
      node(card, 'p', delta === 0 ? t.atPar : format(delta > 0 ? t.abovePar : t.belowPar, { value: Math.abs(delta) }), 'par-result');
    }
    if (session.usedHint) node(card, 'p', t.hintCap, 'assist-stamp');
    node(card, 'p', title.flavor, 'timecard-note');
    if (won && level.id === levels.at(-1)?.id) node(card, 'p', t.ending, 'timecard-note');

    const actions = node(screen, 'div', undefined, 'screen-actions');
    const next = levels.find((candidate) => candidate.id === level.id + 1);
    const retry = () => this.scene.start('Play', { level });
    const undo = () => {
      session.undo();
      this.scene.start('Play', { session });
    };
    if (won && next) this.button(actions, t.nextShift, () => this.scene.start('Play', { level: next }), true);
    this.button(actions, t.retry, retry, !won);
    this.button(actions, t.undoBeat, undo);
    this.button(actions, t.select, () => this.scene.start('LevelSelect'));
    const controller = new AbortController();
    bindKeyboard((command) => command === 'UNDO' ? undo() : retry(), controller.signal,
      (command) => command === 'UNDO' || command === 'RESTART');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => controller.abort());
  }
}
import Phaser from 'phaser';
