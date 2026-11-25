import type { Stars } from './scoring';

export interface RecordEntry {
  readonly stars: Stars;
  readonly faults: number;
  readonly shifts: number;
}

export type Progress = Readonly<Record<number, RecordEntry>>;

export function recordWin(progress: Progress, levelId: number, result: RecordEntry): Progress {
  const best = progress[levelId];
  if (best && (best.stars > result.stars || (best.stars === result.stars &&
    (best.faults < result.faults || (best.faults === result.faults && best.shifts <= result.shifts))))) return progress;
  return { ...progress, [levelId]: result };
}
