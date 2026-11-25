import type Phaser from 'phaser';
import type { Skill } from '../../core/types';

export const skillColors: Record<Skill, number> = {
  wrench: 0x61ebd2,
  flame: 0xffa477,
  feather: 0xb8a4ff,
  muscle: 0xf9d87a,
  eye: 0x7fb9ff,
};

type Point = readonly [number, number];

export function drawBadge(g: Phaser.GameObjects.Graphics, skill: Skill, x: number, y: number, size: number, alpha = 1): void {
  g.fillStyle(skillColors[skill], alpha);

  switch (skill) {
    case 'eye':
      g.fillCircle(x, y, size);
      break;
    case 'muscle':
      g.fillRoundedRect(x - size, y - size, size * 2, size * 2, size * 0.24);
      break;
    case 'wrench':
      polygon([[-0.54, -1], [0.54, -1], [1, 0], [0.54, 1], [-0.54, 1], [-1, 0]]);
      break;
    case 'flame':
      polygon([[0, -1.12], [1.07, 0.85], [-1.07, 0.85]]);
      break;
    case 'feather':
      polygon([[0, -1.14], [1.04, 0], [0, 1.14], [-1.04, 0]]);
      break;
  }

  drawIcon(g, skill, x, y + (skill === 'flame' ? size * 0.18 : 0), size * 0.6, 0x101a32, alpha);

  function polygon(points: readonly Point[]): void {
    g.fillPoints(points.map(([dx, dy]) => ({ x: x + dx * size, y: y + dy * size })), true);
  }
}

export function drawIcon(
  g: Phaser.GameObjects.Graphics, skill: Skill, x: number, y: number, size: number, color: number, alpha = 1,
): void {
  g.lineStyle(Math.max(1.5, size * 0.24), color, alpha);
  g.fillStyle(color, alpha);

  function stroke(points: readonly Point[], closed = false): void {
    g.strokePoints(points.map(([dx, dy]) => ({ x: x + dx * size, y: y + dy * size })), closed);
  }

  switch (skill) {
    case 'wrench':
      stroke([[0.74, -0.71], [0.38, -0.37], [0.73, -0.03], [1, -0.33]]);
      stroke([[0.65, -0.78], [0.19, -0.66], [0.04, -0.23], [-0.71, 0.49], [-0.78, 0.71], [-0.49, 0.8], [-0.25, 0.57], [0.34, 0.06], [0.74, 0.11], [0.99, -0.29]]);
      break;
    case 'flame':
      stroke([[0.23, -0.94], [0.36, -0.32], [0.73, 0.07], [0.68, 0.55], [0.31, 0.85], [-0.25, 0.85], [-0.66, 0.53], [-0.7, 0.09], [-0.44, -0.32], [-0.2, 0.13], [0.23, -0.94]], true);
      break;
    case 'feather':
      stroke([[-0.81, 0.77], [0.55, -0.61]]);
      stroke([[-0.51, 0.48], [-0.45, -0.15], [-0.02, -0.65], [0.69, -0.78], [0.62, -0.14], [0.21, 0.31], [-0.51, 0.48]], true);
      break;
    case 'muscle':
      stroke([[-0.78, 0.51], [-0.63, -0.02], [-0.38, -0.66], [0.02, -0.83], [0.32, -0.52], [0.1, -0.29], [-0.19, -0.29], [-0.2, 0.19], [0.09, 0.01], [0.51, 0.02], [0.82, 0.32], [0.68, 0.62], [0.27, 0.76], [-0.29, 0.76], [-0.78, 0.51]], true);
      break;
    case 'eye':
      stroke([[-0.98, 0], [-0.65, -0.39], [-0.26, -0.55], [0.26, -0.55], [0.65, -0.39], [0.98, 0], [0.65, 0.39], [0.26, 0.55], [-0.26, 0.55], [-0.65, 0.39]], true);
      g.fillCircle(x, y, size * 0.24);
      break;
  }
}
