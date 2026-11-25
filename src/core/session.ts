import { applyAction, createInitialState } from './rules';
import type { Action, GameState, Level } from './types';

export class ShiftSession {
  private history: GameState[] = [];
  private current: GameState;
  private assisted = false;

  constructor(readonly level: Level) {
    this.current = createInitialState(level);
  }

  get state(): GameState {
    return this.current;
  }

  get canUndo(): boolean {
    return this.history.length > 0;
  }

  get usedHint(): boolean {
    return this.assisted;
  }

  useHint(): void {
    this.assisted = true;
  }

  act(action: Action): void {
    const next = applyAction(this.level, this.current, action);
    if (next === this.current) return;
    this.history.push(this.current);
    this.current = next;
  }

  undo(): void {
    const previous = this.history.pop();
    if (previous) this.current = previous;
  }

  restart(): void {
    this.history = [];
    this.assisted = false;
    this.current = createInitialState(this.level);
  }
}
