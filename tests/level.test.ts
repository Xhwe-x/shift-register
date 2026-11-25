import { describe, expect, it } from 'vitest';
import { parseLevel } from '../src/core/level';
import firstLevel from '../src/levels/01.json';

describe('level parsing', () => {
  it('allows duplicate skills with distinct worker IDs', () => {
    const workers = firstLevel.workers.map((worker) => ({ ...worker, skill: 'wrench' }));
    expect(parseLevel({ ...firstLevel, workers }).workers).toEqual(workers);
  });

  it('rejects duplicate IDs and missing workers', () => {
    const workers = firstLevel.workers.map((worker) => ({ ...worker, id: 'w1' }));
    expect(() => parseLevel({ ...firstLevel, workers })).toThrow(/unique/);
    expect(() => parseLevel({ ...firstLevel, workers: [] })).toThrow(/one worker/);
  });

  it('rejects invalid dimensions and demands', () => {
    expect(() => parseLevel({ ...firstLevel, slots: 2 })).toThrow(/3 to 6/);
    expect(() => parseLevel({ ...firstLevel, beats: [] })).toThrow(/at least one/);
    expect(() => parseLevel({ ...firstLevel, beats: [['wrench']] })).toThrow(/every slot/);
    expect(() => parseLevel({ ...firstLevel, beats: [[null, null, null, null, 'moon']] })).toThrow(/every slot/);
    expect(() => parseLevel({ ...firstLevel, allowedFaults: -1 })).toThrow(/non-negative/);
  });
});
