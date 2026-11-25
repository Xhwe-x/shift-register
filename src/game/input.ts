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

export function commandForKey({ code, key, location }: Pick<KeyboardEvent, 'code' | 'key' | 'location'>): Command | undefined {
  if (code && code !== 'Unidentified') return keyCommands.get(code);

  // Some input methods report the key without a physical code.
  if (/^[a-z]$/i.test(key)) return keyCommands.get('Key' + key.toUpperCase());
  if (key === ' ') return 'WAIT';
  if (key === 'Shift') {
    if (location === 1) return 'SHIFT_LEFT';
    if (location === 2) return 'SHIFT_RIGHT';
  }
  return keyCommands.get(key);
}

export function bindKeyboard(
  onCommand: (command: Command) => void, signal: AbortSignal, accepts: (command: Command) => boolean = () => true,
): void {
  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;

    const command = commandForKey(event);
    if (!command || !accepts(command)) return;
    event.preventDefault();
    if (!event.repeat) onCommand(command);
  }, { capture: true, signal });
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
    const keys = { SHIFT_LEFT: t.leftKey + ' / A', SHIFT_RIGHT: t.rightKey + ' / D', WAIT: t.space + ' / S' };
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

    bindKeyboard((command) => {
      if (!this.buttons.get(command)?.disabled) onCommand(command);
    }, signal);
  }

  update(canAct: boolean, canUndo: boolean): void {
    for (const [command, button] of this.buttons) {
      if (command === 'RESTART') continue;
      button.disabled = command === 'UNDO' ? !canUndo : !canAct;
    }
  }
}
