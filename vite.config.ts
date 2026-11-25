import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [{
    name: 'include-distribution-licenses',
    apply: 'build',
    generateBundle() {
      for (const [fileName, path] of [
        ['LICENSE.txt', './LICENSE'],
        ['PHASER-LICENSE.txt', './node_modules/phaser/LICENSE.md'],
        ['EVENTEMITTER3-LICENSE.txt', './node_modules/eventemitter3/LICENSE'],
      ] as const) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(new URL(path, import.meta.url)) });
      }
    },
  }],
});
