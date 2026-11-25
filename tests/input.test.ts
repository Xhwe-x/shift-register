import { describe, expect, it } from 'vitest';
import { commandForKey } from '../src/game/input';

describe('keyboard shortcuts', () => {
  it('uses physical codes for A, D, and S even when an input method changes the reported character', () => {
    expect(commandForKey({ code: 'KeyA', key: 'q', location: 0 })).toBe('SHIFT_LEFT');
    expect(commandForKey({ code: 'KeyD', key: 'Process', location: 0 })).toBe('SHIFT_RIGHT');
    expect(commandForKey({ code: 'KeyS', key: 'Dead', location: 0 })).toBe('WAIT');
  });

  it('recognizes letters, arrows, and space when the physical code is unavailable', () => {
    expect(commandForKey({ code: '', key: 'A', location: 0 })).toBe('SHIFT_LEFT');
    expect(commandForKey({ code: 'Unidentified', key: 'd', location: 0 })).toBe('SHIFT_RIGHT');
    expect(commandForKey({ code: '', key: 's', location: 0 })).toBe('WAIT');
    expect(commandForKey({ code: '', key: 'ArrowDown', location: 0 })).toBe('WAIT');
    expect(commandForKey({ code: '', key: ' ', location: 0 })).toBe('WAIT');
  });

  it('only treats a generic Shift as a move when its side is known', () => {
    expect(commandForKey({ code: '', key: 'Shift', location: 1 })).toBe('SHIFT_LEFT');
    expect(commandForKey({ code: '', key: 'Shift', location: 2 })).toBe('SHIFT_RIGHT');
    expect(commandForKey({ code: '', key: 'Shift', location: 0 })).toBeUndefined();
  });

  it('leaves unrelated physical keys unmapped', () => {
    expect(commandForKey({ code: 'KeyQ', key: 'a', location: 0 })).toBeUndefined();
    expect(commandForKey({ code: '', key: 'Process', location: 0 })).toBeUndefined();
  });
});
