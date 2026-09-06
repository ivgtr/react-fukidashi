import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const require = createRequire(import.meta.url);
const esm = await import('react-fukidashi');
const cjs = require('react-fukidashi');
for (const entry of [esm, cjs]) {
  for (const name of ['Bubble', 'Fukidashi', 'Typewriter', 'useTypewriter', 'useReducedMotion'])
    assert.ok(entry[name], name);
  assert.match(renderToString(createElement(entry.Bubble, null, 'SSR works')), /SSR works/);
  assert.match(renderToString(createElement(entry.Typewriter, { text: '日本語 👩🏽‍💻' })), /日本語/);
}
for (const entry of ['dist/index.js', 'dist/cjs/index.js']) {
  assert.match(readFileSync(entry, 'utf8'), /["']use client["']/);
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const [pack] = JSON.parse(
  execFileSync(npm, ['pack', '--dry-run', '--ignore-scripts', '--json'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  }),
);
const paths = pack.files.map((file) => file.path);
for (const path of [
  'API.md',
  'MIGRATION.md',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/cjs/index.js',
  'dist/cjs/index.d.ts',
  'dist/cjs/package.json',
  'dist/style.css',
])
  assert.ok(paths.includes(path), path);
assert.ok(
  !paths.some((path) => /^(demo|test|e2e|src|fixtures)\//.test(path)),
  'Do not publish development sources',
);
console.log(`Package exports, SSR, declarations, CSS and ${paths.length} packed files verified.`);
