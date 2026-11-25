import type { Progress, RecordEntry } from '../core/progress';

const progressKey = 'shift-register.progress.v1';
let current: Progress | undefined;

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function getProgress(): Progress {
  if (current) return current;

  const valid: Record<number, RecordEntry> = {};
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(progressKey) ?? 'null');
    if (stored && typeof stored === 'object') {
      for (const [key, data] of Object.entries(stored)) {
        const id = Number(key);
        if (!isCount(id) || id === 0 || !data || typeof data !== 'object') continue;
        const { stars, faults, shifts } = data as Record<string, unknown>;
        if ((stars === 1 || stars === 2 || stars === 3) && isCount(faults) && isCount(shifts)) {
          valid[id] = { stars, faults, shifts };
        }
      }
    }
  } catch {
    // Storage may be unavailable in an embedded or private browsing session.
  }
  current = valid;
  return current;
}

export function saveProgress(progress: Progress): void {
  current = progress;
  try {
    localStorage.setItem(progressKey, JSON.stringify(progress));
  } catch {
    // Keep the current session playable with the in-memory copy.
  }
}
