import { SKILLS } from './types';
import type { Level, Skill, Worker } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSkill(value: unknown): value is Skill {
  return typeof value === 'string' && SKILLS.some((skill) => skill === value);
}

function isWorker(value: unknown): value is Worker {
  return isRecord(value) && typeof value.id === 'string' && value.id.trim() !== '' && isSkill(value.skill);
}

function isIntegerInRange(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function parseLevel(value: unknown): Level {
  if (!isRecord(value)) throw new Error('Level must be an object.');
  const { id, name, flavor, slots, workers, beats, allowedFaults } = value;

  if (!isIntegerInRange(id, 1)) throw new Error('Level id must be a positive integer.');
  if (typeof name !== 'string' || !name.trim() || typeof flavor !== 'string') {
    throw new Error('Level requires a name and flavor text.');
  }
  if (!isIntegerInRange(slots, 3, 6)) throw new Error('Level must have 3 to 6 slots.');
  if (!Array.isArray(workers) || workers.length !== slots || !workers.every(isWorker)) {
    throw new Error('Level needs one worker with a valid skill per slot.');
  }
  if (new Set(workers.map((worker) => worker.id)).size !== slots) {
    throw new Error('Worker IDs must be unique.');
  }
  if (!Array.isArray(beats) || beats.length === 0) throw new Error('Level requires at least one beat.');
  const parsedBeats = beats.map((beat: unknown) => {
    if (!Array.isArray(beat) || beat.length !== slots || !beat.every((skill) => skill === null || isSkill(skill))) {
      throw new Error('Each beat needs a skill or null for every slot.');
    }
    return beat;
  });
  if (!isIntegerInRange(allowedFaults, 0)) throw new Error('Fault allowance must be a non-negative integer.');
  if (value.rules !== undefined && !isRecord(value.rules)) throw new Error('Level rules must be an object.');
  const pinned = value.rules?.pinned ?? [];
  if (!Array.isArray(pinned) || !pinned.every((slot) => isIntegerInRange(slot, 0, slots - 1)) ||
    new Set(pinned).size !== pinned.length) {
    throw new Error('Pinned slots must be distinct in-range integers.');
  }

  return { id, name, flavor, slots, workers, beats: parsedBeats, rules: { pinned }, allowedFaults };
}
