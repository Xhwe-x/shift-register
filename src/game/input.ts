import type { Action } from '../core/types';

export type Command = Action | 'UNDO' | 'RESTART';

const keyCommands = new Map<string, Command>([
  ['ShiftLeft', 'SHIFT_LEFT'],
  ['ArrowLeft', 'SHIFT_LEFT'],
  ['KeyA', 'SHIFT_LEFT'],
  ['ShiftRight', 'SHIFT_RIGHT'],
  ['ArrowRight', 'SHIFT_RIGHT'],
  ['KeyD', 'SHIFT_RIGHT'],
  ['Space', 'WAIT'],
  ['ArrowDown', 'WAIT'],
  ['KeyS', 'WAIT'],
  ['KeyZ', 'UNDO'],
  ['Backspace', 'UNDO'],
  ['KeyR', 'RESTART'],
]);

export class TouchButtons {
  private buttons = new Map<Command, HTMLButtonElement>();

  constructor(
    root: HTMLElement,
    onCommand: (command: Command) => void,
    onPreview: (action: Action | null) => void,
    signal: AbortSignal,
  ) {
    for (const button of root.querySelectorAll<HTMLButtonElement>('button[data-command]')) {
      const command = button.dataset.command as Command;
      this.buttons.set(command, button);
      button.addEventListener('click', () => onCommand(command), { signal });
      if (command === 'UNDO' || command === 'RESTART') continue;

      button.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse' && !button.disabled) onPreview(command);
      }, { signal });
      button.addEventListener('pointerleave', () => onPreview(null), { signal });
    }

    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;

      const command = keyCommands.get(event.code);
      if (!command) return;
      event.preventDefault();
      if (!event.repeat) onCommand(command);
    }, { signal });
  }

  update(canAct: boolean, canUndo: boolean): void {
    for (const [command, button] of this.buttons) {
      if (command === 'RESTART') continue;
      button.disabled = command === 'UNDO' ? !canUndo : !canAct;
    }
  }
}
