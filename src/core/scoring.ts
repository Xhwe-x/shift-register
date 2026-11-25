export type Stars = 1 | 2 | 3;

export function starsFor(faults: number, usedHint = false): Stars {
  if (faults === 0 && !usedHint) return 3;
  return faults <= 1 ? 2 : 1;
}
