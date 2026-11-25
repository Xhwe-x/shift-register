import { levels } from '../../levels';
import { format, levelText, words } from '../../i18n';
import { getProgress } from '../storage';
import { node, ScreenScene } from './screens';

export class LevelSelectScene extends ScreenScene {
  constructor() { super('LevelSelect'); }

  create(): void {
    const screen = this.open();
    const t = words();
    node(screen, 'p', t.factory + ' / ' + t.night, 'machine-label');
    this.heading(screen, t.select);
    const grid = node(screen, 'div', undefined, 'shift-grid');
    const progress = getProgress();
    for (const level of levels) {
      const entry = progress[level.id];
      const button = this.button(grid, '', () => this.scene.start('Play', { level }));
      node(button, 'span', String(level.id).padStart(2, '0'), 'machine-label');
      node(button, 'span', levelText(level).name);
      node(button, 'span', entry ? format(t.cleared, { value: entry.stars }) : t.ready, 'shift-best');
    }
    this.button(screen, t.menu, () => this.scene.start('Menu'));
  }
}
