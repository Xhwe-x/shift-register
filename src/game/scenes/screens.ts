import Phaser from 'phaser';

export function node<K extends keyof HTMLElementTagNameMap>(
  parent: HTMLElement, tag: K, value?: string, className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (value !== undefined) element.textContent = value;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

export abstract class ScreenScene extends Phaser.Scene {
  protected open(): HTMLElement {
    const screen = document.querySelector<HTMLElement>('#screen')!;
    const play = document.querySelector<HTMLElement>('#play')!;
    play.hidden = true;
    screen.hidden = false;
    screen.replaceChildren();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      screen.hidden = true;
      screen.replaceChildren();
      play.hidden = false;
    });
    return screen;
  }

  protected heading(screen: HTMLElement, label: string): HTMLHeadingElement {
    const title = node(screen, 'h2', label);
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
    return title;
  }

  protected button(parent: HTMLElement, label: string, callback: () => void, primary = false): HTMLButtonElement {
    const button = node(parent, 'button', label, primary ? 'accent-button' : undefined);
    button.type = 'button';
    button.addEventListener('click', callback);
    return button;
  }
}
