import { levels, tutorialLevel } from '../../levels';
import { getProgress } from '../storage';
import { node, ScreenScene } from './screens';

export class MenuScene extends ScreenScene {
  constructor() { super('Menu'); }

  create(): void {
    const screen = this.open();
    node(screen, 'p', 'DREAM FACTORY / NIGHT SHIFT', 'machine-label');
    node(screen, 'h2', 'Shift Register');
    node(screen, 'p', 'Match your crew to the machines, one beat at a time.', 'screen-intro');
    const actions = node(screen, 'div', undefined, 'screen-actions');
    const progress = getProgress();
    const next = levels.find((level) => !progress[level.id]) ?? tutorialLevel;
    this.button(actions, next.id === 1 ? 'Clock in' : 'Continue shift', () => this.scene.start('Play', { level: next }), true);
    this.button(actions, 'Choose a shift', () => this.scene.start('LevelSelect'));
  }
}
