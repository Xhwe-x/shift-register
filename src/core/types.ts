export const SKILLS = ['wrench', 'flame', 'feather', 'muscle', 'eye'] as const;
export type Skill = (typeof SKILLS)[number];

export const ACTIONS = ['SHIFT_LEFT', 'SHIFT_RIGHT', 'WAIT'] as const;
export type Action = (typeof ACTIONS)[number];

export interface Worker {
  readonly id: string;
  readonly skill: Skill;
}

export type Beat = readonly (Skill | null)[];

export interface Level {
  readonly id: number;
  readonly name: string;
  readonly flavor: string;
  readonly slots: number;
  readonly workers: readonly Worker[];
  readonly beats: readonly Beat[];
  readonly allowedFaults: number;
}

export type Crew = readonly (Worker | null)[];

export interface BeatResult {
  readonly beatIndex: number;
  readonly matchedSlots: readonly number[];
  readonly faultSlots: readonly number[];
  readonly idleSlots: readonly number[];
}

export interface GameState {
  readonly beatIndex: number;
  readonly crew: Crew;
  readonly faults: number;
  readonly shifts: number;
  readonly lastResult: BeatResult | null;
}
