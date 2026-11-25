import { levels } from '../../levels';
import { getProgress } from '../storage';
import { node, ScreenScene } from './screens';

export class LevelSelectScene extends ScreenScene {
  constructor() { super('LevelSelect'); }

  create(): void {
    const screen = this.open();
    node(screen, 'p', 'DREAM FACTORY / NIGHT SHIFT', 'machine-label');
    node(screen, 'h2', 'Choose a shift');
    const grid = node(screen, 'div', undefined, 'shift-grid');
    const progress = getProgress();
    for (const level of levels) {
      const entry = progress[level.id];
      const button = this.button(grid, '', () => this.scene.start('Play', { level }));
      node(button, 'span', String(level.id).padStart(2, '0'), 'machine-label');
      node(button, 'span', level.name);
      node(button, 'span', entry ? entry.stars + ' / 3 stars' : 'Ready', 'shift-best');
    }
    this.button(screen, 'Main menu', () => this.scene.start('Menu'));
  }
}
