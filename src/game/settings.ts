import type { Language } from '../i18n';

export interface Settings {
  readonly language: Language;
  readonly reducedMotion: boolean | undefined;
  readonly muted: boolean;
}

const settingsKey = 'shift-register.settings.v1';
let preferences: Settings | undefined;

export function getSettings(): Settings {
  if (preferences) return preferences;
  let language: Language = 'auto';
  let reducedMotion: boolean | undefined;
  let muted = false;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(settingsKey) ?? 'null');
    if (saved && typeof saved === 'object') {
      const entry = saved as Record<string, unknown>;
      if (entry.language === 'en' || entry.language === 'zh') language = entry.language;
      if (typeof entry.reducedMotion === 'boolean') reducedMotion = entry.reducedMotion;
      muted = entry.muted === true;
    }
  } catch {
    // Use defaults if storage is unavailable or a saved value is invalid.
  }
  preferences = { language, reducedMotion, muted };
  return preferences;
}

export function saveSetting(change: Partial<Settings>): void {
  preferences = { ...getSettings(), ...change };
  try {
    localStorage.setItem(settingsKey, JSON.stringify(preferences));
  } catch {
    // In-memory settings remain in effect.
  }
}

export function reduceMotion(): boolean {
  return getSettings().reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
}
