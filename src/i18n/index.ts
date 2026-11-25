import type { Level } from '../core/types';
import { en } from './en';
import { zh, zhLevels } from './zh';

export type Language = 'auto' | 'en' | 'zh';
let locale: 'en' | 'zh' = 'en';

export function setLanguage(language: Language): void {
  locale = language === 'auto' ? (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en') : language;
  document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
  document.title = words().title + (locale === 'zh' ? ' · Shift Register' : ' · 交接班');
}

export function words(): typeof en {
  return locale === 'zh' ? zh : en;
}

export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (original, key: string) => String(values[key] ?? original));
}

export function levelText(level: Level): { name: string; flavor: string } {
  const translation = locale === 'zh' ? zhLevels[level.id - 1] : undefined;
  return translation ? { name: translation[0], flavor: translation[1] } : level;
}
