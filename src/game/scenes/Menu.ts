import { levels, tutorialLevel } from '../../levels';
import { setLanguage, words } from '../../i18n';
import type { Language } from '../../i18n';
import { getSettings, reduceMotion, saveSetting } from '../settings';
import { getProgress } from '../storage';
import { node, ScreenScene } from './screens';

export class MenuScene extends ScreenScene {
  constructor() { super('Menu'); }

  create(): void {
    const screen = this.open();
    const t = words();
    node(screen, 'p', t.factory + ' / ' + t.night, 'machine-label');
    this.heading(screen, t.title);
    node(screen, 'p', t.menuIntro, 'screen-intro');
    const line = node(screen, 'div', undefined, 'menu-line');
    line.setAttribute('aria-hidden', 'true');
    for (const skill of ['wrench', 'flame', 'feather', 'muscle', 'eye']) node(line, 'span', undefined, skill);
    const actions = node(screen, 'div', undefined, 'screen-actions');
    const progress = getProgress();
    const next = levels.find((level) => !progress[level.id]) ?? tutorialLevel;
    this.button(actions, next.id === 1 ? t.clockIn : t.continue, () => this.scene.start('Play', { level: next }), true);
    this.button(actions, t.select, () => this.scene.start('LevelSelect'));

    const options = node(screen, 'fieldset', undefined, 'game-settings');
    node(options, 'legend', t.settings, 'machine-label');
    const locale = node(options, 'label', t.language);
    const language = node(locale, 'select');
    const choices: [Language, string][] = [['auto', t.browser], ['en', 'English'], ['zh', '简体中文']];
    for (const [key, label] of choices) node(language, 'option', label).value = key;
    language.value = getSettings().language;
    language.addEventListener('change', () => {
      const selected = language.value as Language;
      saveSetting({ language: selected });
      setLanguage(selected);
      this.scene.restart();
    });
    const motion = node(options, 'label');
    const checkbox = node(motion, 'input');
    checkbox.type = 'checkbox';
    checkbox.checked = reduceMotion();
    node(motion, 'span', t.motion);
    checkbox.addEventListener('change', () => saveSetting({ reducedMotion: checkbox.checked }));
  }
}
