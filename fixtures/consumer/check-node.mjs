import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import * as esm from 'react-fukidashi';

const require = createRequire(import.meta.url);
const cjs = require('react-fukidashi');
const location = relative(process.cwd(), realpathSync(require.resolve('react-fukidashi')));
assert.ok(
  !location.startsWith('..') && !isAbsolute(location),
  'Resolve the isolated installation, not the source checkout',
);
const pkg = require('react-fukidashi/package.json');
assert.equal(pkg.version, process.env.EXPECTED_VERSION);
for (const entry of [esm, cjs]) {
  for (const name of ['Bubble', 'Fukidashi', 'Typewriter', 'useTypewriter', 'useReducedMotion'])
    assert.ok(entry[name]);
  assert.match(renderToString(createElement(entry.Bubble, null, 'Installed SSR')), /Installed SSR/);
  assert.match(
    renderToString(createElement(entry.Typewriter, { text: '日本語 👩🏽‍💻', paused: true })),
    /日本語/,
  );
  assert.match(
    renderToString(createElement(entry.Fukidashi, { anchor: 'Anchor' }, 'Note')),
    /Anchor/,
  );
}
assert.match(
  readFileSync(require.resolve('react-fukidashi/style.css'), 'utf8'),
  /fukidashi-unrevealed/,
);
console.log(`Isolated ESM/CJS, SSR and CSS resolution passed for ${pkg.name}@${pkg.version}`);
