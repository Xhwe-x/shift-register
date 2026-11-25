import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';
import { zipSync } from 'fflate';

const project = fileURLToPath(new URL('../', import.meta.url));
const dist = join(project, 'dist');
const output = join(project, 'shift-register-itch.zip');
const entries = await readdir(dist, { recursive: true, withFileTypes: true });
const files = entries.filter((entry) => entry.isFile())
  .map((entry) => relative(dist, join(entry.parentPath, entry.name)))
  .sort();

if (!files.includes('index.html')) throw new Error('Missing dist/index.html. Run npm run build first.');

const content = Object.fromEntries(await Promise.all(files.map(async (file) =>
  [file.split(sep).join('/'), await readFile(join(dist, file))],
)));
const zip = zipSync(content, { level: 9, mtime: new Date(2026, 0, 1) });
await writeFile(output, zip);
console.log('Packed ' + files.length + ' files into shift-register-itch.zip (' + zip.byteLength + ' bytes).');
