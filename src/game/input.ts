import type { Action } from '../core/types';
import { words } from '../i18n';

export type Command = Action | 'UNDO' | 'RESTART' | 'HINT';

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
  ['KeyH', 'HINT'],
]);

export function bindKeyboard(
  onCommand: (command: Command) => void, signal: AbortSignal, accepts: (command: Command) => boolean = () => true,
): void {
  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const command = keyCommands.get(event.code);
    if (!command || !accepts(command)) return;
    event.preventDefault();
    if (!event.repeat) onCommand(command);
  }, { signal });
}

export class TouchButtons {
  private buttons = new Map<Command, HTMLButtonElement>();

  constructor(
    root: HTMLElement,
    onCommand: (command: Command) => void,
    onPreview: (action: Action | null) => void,
    signal: AbortSignal,
  ) {
    const t = words();
    const labels: Record<Command, string> = {
      SHIFT_LEFT: t.left, SHIFT_RIGHT: t.right, WAIT: t.wait, UNDO: t.undo, RESTART: t.redo, HINT: t.hint,
    };
    const keys = { SHIFT_LEFT: t.leftKey, SHIFT_RIGHT: t.rightKey, WAIT: t.space };
    root.setAttribute('aria-label', t.controls);
    for (const button of root.querySelectorAll<HTMLButtonElement>('button[data-command]')) {
      const command = button.dataset.command as Command;
      this.buttons.set(command, button);
      button.querySelector<HTMLElement>('.control-label')!.textContent = labels[command];
      button.addEventListener('click', () => onCommand(command), { signal });
      if (command === 'UNDO' || command === 'RESTART' || command === 'HINT') continue;
      button.querySelector<HTMLElement>('kbd')!.textContent = keys[command];

      button.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse' && !button.disabled) onPreview(command);
      }, { signal });
      button.addEventListener('pointerleave', () => onPreview(null), { signal });
    }

    bindKeyboard(onCommand, signal);
  }

  update(canAct: boolean, canUndo: boolean): void {
    for (const [command, button] of this.buttons) {
      if (command === 'RESTART') continue;
      button.disabled = command === 'UNDO' ? !canUndo : !canAct;
    }
  }
}
