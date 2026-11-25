import Phaser from 'phaser';
import { applyAction, isLost, isWon } from '../../core/rules';
import { recordWin } from '../../core/progress';
import { starsFor } from '../../core/scoring';
import { ShiftSession } from '../../core/session';
import type { Action, Beat, Crew, Level, Worker } from '../../core/types';
import { tutorialLevel } from '../../levels';
import { TouchButtons } from '../input';
import type { Command } from '../input';
import { getProgress, saveProgress } from '../storage';
import { drawBadge, skillColors } from '../ui/skills';

const ink = '#ecf5ff';
const muted = '#adc3e2';
const mint = '#61ebd2';
const red = '#ff8e96';
const card = 0x111b34;
const border = 0x293c60;
const columnStart = 218;
const columnWidth = 676;
const previewRows = [320, 263, 212] as const;

export class PlayScene extends Phaser.Scene {
  private session = new ShiftSession(tutorialLevel);
  private board!: Phaser.GameObjects.Graphics;
  private notices!: Phaser.GameObjects.Container;
  private controls!: TouchButtons;
  private status!: HTMLElement;
  private beatLabel!: Phaser.GameObjects.Text;
  private faultLabel!: Phaser.GameObjects.Text;
  private message!: HTMLElement;
  private report!: HTMLButtonElement;

  constructor() {
    super('Play');
  }

  private get level(): Level {
    return this.session.level;
  }

  init({ level, session }: { level?: Level; session?: ShiftSession }): void {
    this.session = session ?? new ShiftSession(level ?? tutorialLevel);
  }

  create(): void {
    document.querySelector<HTMLElement>('#play')!.hidden = false;
    this.scale.refresh();
    this.board = this.add.graphics();
    this.notices = this.add.container();
    this.label(44, 25, 'DREAM FACTORY  /  NIGHT SHIFT', 15, mint, true);
    this.label(40, 47, 'SHIFT REGISTER', 51, ink, true);
    this.label(44, 111, String(this.level.id).padStart(2, '0') + '  /  ' + this.level.name.toUpperCase(), 20, muted, true);
    this.label(44, 144, 'Move the whole crew one slot. Match each lit machine’s symbol.', 22);
    this.beatLabel = this.label(505, 111, '', 20, muted, true);
    this.faultLabel = this.label(916, 56, '', 21, muted, true).setOrigin(1, 0);
    this.label(64, 212, 'IN 2 BEATS', 16, muted, true).setOrigin(0, 0.5);
    this.label(64, 263, 'NEXT BEAT', 16, muted, true).setOrigin(0, 0.5);
    this.label(64, 320, 'RUN THIS BEAT', 16, mint, true).setOrigin(0, 0.5);
    this.label(64, 410, 'MACHINES', 16, muted, true).setOrigin(0, 0.5);
    this.label(64, 511, 'CREW', 16, muted, true).setOrigin(0, 0.5);
    if (this.level.rules.overflow) this.label(64, 570, 'RESERVE', 16, muted, true).setOrigin(0, 0.5);

    for (let slot = 0; slot < this.level.slots; slot += 1) {
      const pinned = this.level.rules.pinned.includes(slot);
      this.label(this.columnX(slot), 446, '0' + (slot + 1) + (pinned ? ' · PIN' : ''), 14, pinned ? mint : muted, true).setOrigin(0.5, 0);
    }

    this.message = document.querySelector<HTMLElement>('#turn-message')!;
    const controller = new AbortController();
    this.controls = new TouchButtons(
      document.querySelector<HTMLElement>('#controls')!,
      (command) => this.onCommand(command),
      (action) => this.draw(action),
      controller.signal,
    );
    this.status = document.querySelector<HTMLElement>('#turn-status')!;
    this.report = document.querySelector<HTMLButtonElement>('#view-report')!;
    this.report.addEventListener('click', () => this.scene.start('Result', { session: this.session }), { signal: controller.signal });
    document.querySelector<HTMLButtonElement>('#choose-shift')!.addEventListener(
      'click', () => this.scene.start('LevelSelect'), { signal: controller.signal },
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => controller.abort());
    this.draw();
    this.announce();
  }

  private label(x: number, y: number, value: string, size: number, color = ink, bold = false): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, {
      color,
      fontFamily: bold ? 'Consolas, monospace' : 'system-ui, sans-serif',
      fontSize: size,
      fontStyle: bold ? 'bold' : 'normal',
    });
  }

  private columnX(slot: number): number {
    return columnStart + (slot + 0.5) * columnWidth / this.level.slots;
  }

  private onCommand(command: Command): void {
    const before = this.session.state;
    switch (command) {
      case 'UNDO':
        this.session.undo();
        break;
      case 'RESTART':
        this.session.restart();
        break;
      default:
        this.session.act(command);
    }
    const after = this.session.state;
    if (after !== before && isWon(this.level, after)) {
      const progress = getProgress();
      const next = recordWin(progress, this.level.id, { stars: starsFor(after.faults), faults: after.faults, shifts: after.shifts });
      if (next !== progress) saveProgress(next);
    }
    this.draw();
    this.announce();
  }

  private describe(): string {
    const { state } = this.session;
    if (isWon(this.level, state)) return 'Shift complete. ' + state.shifts + ' shifts, ' + state.faults + ' faults.';
    if (isLost(this.level, state)) return 'Shift failed. Undo or restart to try again.';
    if (!state.lastResult) {
      if (this.level.id === 1) return 'Shift right to wrap the last worker to the first station.';
      if (this.level.id === 2) return 'The first beat is idle. Use it to prepare for the next one.';
      if (this.level.id === 5 || this.level.id === 6) return 'A worker pushed off the belt leaves. Reserve workers fill the gap in order.';
      if (this.level.id === 7 || this.level.id === 8) return 'Workers marked OFF cannot fill a request on their listed beat.';
      return 'Pinned crew stay put. The other workers shift past them.';
    }
    if (!state.lastResult.faultSlots.length) return 'Beat clear. Check the next set of symbols before moving.';
    return 'Fault at station ' + state.lastResult.faultSlots.map((slot) => slot + 1).join(', ') + '.';
  }

  private announce(): void {
    const { state } = this.session;
    const beat = this.level.beats[state.beatIndex];
    const gameOver = isLost(this.level, state) || isWon(this.level, state);
    this.status.textContent = this.describe() + (beat && !gameOver
      ? ' Beat ' + (state.beatIndex + 1) + ' of ' + this.level.beats.length
        + '. Workers from left to right are ' + state.crew.map((worker) => worker?.skill ?? 'empty').join(', ')
        + '. Machine demands from left to right are ' + beat.map((skill) => skill ?? 'idle').join(', ') + '.'
        + this.level.rules.absences.filter((absence) => absence.beat >= state.beatIndex && absence.beat < state.beatIndex + 3)
          .map((absence) => {
            const slot = state.crew.findIndex((worker) => worker?.id === absence.workerId);
            return slot < 0 ? '' : ' Worker at station ' + (slot + 1) + ' is off on beat ' + (absence.beat + 1) + '.';
          }).join('')
      : '');
  }

  private draw(action: Action | null = null): void {
    const { level, state } = this.session;
    const lost = isLost(level, state);
    const won = isWon(level, state);
    const active = !lost && !won;
    const projection = action && active ? applyAction(level, state, action) : null;
    const demand = level.beats[active ? state.beatIndex : state.beatIndex - 1];
    const crew = projection?.crew ?? state.crew;
    const g = this.board;
    g.clear();
    this.notices.removeAll(true);

    this.beatLabel.setText('BEAT ' + Math.min(state.beatIndex + 1, level.beats.length) + ' / ' + level.beats.length);
    this.faultLabel.setText('FAULTS ' + state.faults + ' / ' + level.allowedFaults).setColor(lost ? red : muted);
    g.fillStyle(border).fillRoundedRect(809, 88, 107, 5, 2);
    const meter = Math.min(1, state.faults / Math.max(1, level.allowedFaults));
    if (meter > 0) g.fillStyle(lost ? 0xff8e96 : 0xf9d87a).fillRoundedRect(809, 88, 107 * meter, 5, 2);

    const cardHeight = level.rules.overflow ? 405 : 395;
    g.fillStyle(card).fillRoundedRect(44, 183, 872, cardHeight, 14);
    g.lineStyle(1, border).strokeRoundedRect(44, 183, 872, cardHeight, 14);
    g.fillStyle(0x132d41).fillRoundedRect(54, 290, 852, 60, 8);
    g.lineStyle(1, 0x419a98).strokeRoundedRect(54, 290, 852, 60, 8);
    g.fillStyle(0x0a142b).fillRoundedRect(54, 471, 852, 91, 8);

    for (let x = 65; x < 901; x += 20) {
      g.lineStyle(1, 0x294464).lineBetween(x, 551, x + 5, 544);
    }
    for (let slot = 0; slot < level.slots; slot += 1) {
      const x = this.columnX(slot);
      g.lineStyle(1, border).lineBetween(x, 195, x, 476);
    }

    for (const [offset, y] of previewRows.entries()) {
      const beat = active ? level.beats[state.beatIndex + offset] : offset === 0 ? demand : undefined;
      this.drawBeat(beat, y, offset, crew, active ? state.beatIndex + offset : state.beatIndex - 1);
    }

    const feedback = projection?.lastResult ?? (active ? null : state.lastResult);
    for (let slot = 0; slot < level.slots; slot += 1) {
      const x = this.columnX(slot);
      const skill = demand?.[slot];
      const matched = feedback?.matchedSlots.includes(slot);
      const fault = feedback?.faultSlots.includes(slot);
      const edge = fault ? 0xff8e96 : matched ? 0x61ebd2 : skill ? skillColors[skill] : border;
      g.fillStyle(0x192844).fillRoundedRect(x - 43, 374, 86, 66, 8);
      g.lineStyle(skill ? 2 : 1, edge).strokeRoundedRect(x - 43, 374, 86, 66, 8);
      g.fillStyle(0x0b152b).fillRoundedRect(x - 26, 385, 52, 44, 6);
      if (skill) drawBadge(g, skill, x, 407, 14);
      g.fillStyle(edge).fillCircle(x + 34, 382, 3);
      if (fault) {
        g.lineStyle(2, edge).lineBetween(x + 28, 427, x + 36, 435).lineBetween(x + 36, 427, x + 28, 435);
      } else if (matched) {
        g.lineStyle(2, edge).lineBetween(x + 27, 431, x + 30, 435).lineBetween(x + 30, 435, x + 37, 427);
      }
    }

    this.drawCrew(crew, active ? state.beatIndex : state.beatIndex - 1, active);
    if (level.rules.overflow) this.drawReserve(projection?.reservePtr ?? state.reservePtr);
    this.controls.update(active, this.session.canUndo);
    this.report.hidden = active;
    const previewMessage = projection?.lastResult
      ? 'Preview  /  ' + projection.lastResult.matchedSlots.length + ' matches, ' + projection.lastResult.faultSlots.length + ' faults.'
      : null;
    this.message.textContent = previewMessage ?? this.describe();
    this.message.dataset.outcome = lost ? 'lost' : won ? 'won' : 'active';
  }

  private drawBeat(beat: Beat | undefined, y: number, offset: number, crew: Crew, beatIndex: number): void {
    for (let slot = 0; slot < this.level.slots; slot += 1) {
      const x = this.columnX(slot);
      const skill = beat?.[slot];
      const g = this.board;
      g.fillStyle(offset === 0 ? 0x122335 : 0x172540).fillRoundedRect(x - 38, y - 20, 76, 40, 6);
      if (skill) {
        drawBadge(g, skill, x, y, offset === 0 ? 17 : 13);
        if (offset === 2) g.fillStyle(card, 0.45).fillRoundedRect(x - 36, y - 18, 72, 36, 6);
      } else {
        g.lineStyle(2, beat ? 0x5c7396 : 0x35486b).lineBetween(x - 5, y, x + 5, y);
      }
      const worker = crew[slot];
      if (beat && worker && this.offIn(worker, beatIndex) === 0) this.drawWarning(x + 29, y - 9);
    }
  }

  private offIn(worker: Worker, beatIndex: number): number {
    let distance = Infinity;
    for (const absence of this.level.rules.absences) {
      if (absence.workerId === worker.id && absence.beat >= beatIndex) {
        distance = Math.min(distance, absence.beat - beatIndex);
      }
    }
    return distance;
  }

  private drawWarning(x: number, y: number): void {
    const g = this.board;
    g.fillStyle(0xf9d87a).fillTriangle(x, y - 8, x + 8, y + 7, x - 8, y + 7);
    g.lineStyle(2, 0x111b34).lineBetween(x, y - 3, x, y + 2);
    g.fillStyle(0x111b34).fillCircle(x, y + 4, 1);
  }

  private drawReserve(reservePtr: number): void {
    const reserve = this.level.rules.reserve.slice(reservePtr);
    if (reserve.length === 0) {
      this.notices.add(this.label(columnStart + 6, 570, 'EMPTY', 14, muted, true).setOrigin(0, 0.5));
      return;
    }
    reserve.forEach((worker, index) => {
      const x = columnStart + 19 + index * 43;
      this.board.fillStyle(0x192844).fillRoundedRect(x - 16, 557, 32, 26, 4);
      drawBadge(this.board, worker.skill, x, 570, 10);
    });
  }

  private drawCrew(crew: Crew, beatIndex: number, active: boolean): void {
    crew.forEach((worker, slot) => {
      if (!worker) return;
      const g = this.board;
      const x = this.columnX(slot);
      g.fillStyle(0x233454).fillEllipse(x, 538, 68, 9);
      g.fillStyle(0x34466b).fillRoundedRect(x - 23, 514, 46, 21, 6);
      drawBadge(g, worker.skill, x, 501, 23);
      g.fillStyle(0x0d1830).fillRoundedRect(x - 16, 513, 32, 15, 7);
      g.fillStyle(0xecf5ff).fillCircle(x - 6, 520, 2).fillCircle(x + 6, 520, 2);
      g.lineStyle(1, 0xecf5ff).lineBetween(x - 1, 524, x + 1, 524);
      const off = this.offIn(worker, beatIndex);
      if (active && Number.isFinite(off)) {
        g.fillStyle(0x3b2e25).fillRoundedRect(x - 36, 533, 72, 21, 4);
        this.notices.add(this.label(x, 543, off === 0 ? 'OFF NOW' : 'OFF in ' + off, 13, '#f9d87a', true).setOrigin(0.5));
      }
    });
  }
}
