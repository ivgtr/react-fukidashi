import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const browserName = process.argv.find((arg) => arg.startsWith('--browser='))?.split('=')[1];
assert.ok(!browserName || ['chromium', 'firefox', 'webkit'].includes(browserName), 'Unknown browser');
const temporary = mkdtempSync(join(tmpdir(), 'react-fukidashi-consumer-'));
const app = join(temporary, 'app');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(command, args, cwd = app, capture = false) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    shell: process.platform === 'win32' && command === npm,
    env: { ...process.env, EXPECTED_VERSION: pkg.version },
    timeout: 180000,
  });
}

try {
  // A real tarball installed OUTSIDE the checkout: no workspaces, aliases,
  // symlinks or ancestor node_modules can conceal missing published files.
  const [pack] = JSON.parse(run(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root, true));
  cpSync(join(root, 'fixtures/consumer'), app, { recursive: true });
  cpSync(join(app, 'types.mts'), join(app, 'types.cts'));
  const exact = (name) => JSON.parse(readFileSync(require.resolve(`${name}/package.json`), 'utf8')).version;
  writeFileSync(join(app, 'package.json'), JSON.stringify({
    name: 'isolated-consumer',
    private: true,
    type: 'module',
    dependencies: {
      'react-fukidashi': `file:${join(temporary, pack.filename)}`,
      react: exact('react'),
      'react-dom': exact('react-dom'),
    },
    devDependencies: Object.fromEntries(['@types/react', '@types/react-dom', '@types/node', 'typescript', 'vite'].map((name) => [name, exact(name)])),
  }, null, 2));
  run(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
  run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
  run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.nodenext.json']);
  run(process.execPath, ['check-node.mjs']);
  run(process.execPath, ['node_modules/vite/bin/vite.js', 'build']);

  if (browserName) {
    const consumerRequire = createRequire(join(app, 'package.json'));
    const { preview } = await import(pathToFileURL(consumerRequire.resolve('vite')).href);
    const playwright = await import('@playwright/test');
    const { expect } = playwright;
    const server = await preview({ root: app, configFile: false, preview: { host: '127.0.0.1', port: 0 } });
    let browser;
    try {
      const address = server.httpServer.address();
      assert.ok(address && typeof address !== 'string');
      browser = await playwright[browserName].launch();
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${address.port}`);
      await expect(page.locator('main > .fukidashi-bubble')).toHaveCSS('border-top-width', '2px');
      await expect(page.locator('main > .fukidashi-bubble')).toHaveCSS('background-color', 'rgb(255, 241, 191)');
      await page.getByRole('button', { name: '全文表示' }).click();
      await expect(page.getByLabel('Playback')).toHaveText('complete');
      await page.getByRole('button', { name: '開閉' }).click();
      await expect(page.getByRole('note')).toBeVisible();
      await expect(page.getByRole('note')).toContainText('インストールしたパッケージです。');
      const images = join(root, 'test-results');
      mkdirSync(images, { recursive: true });
      await page.screenshot({ path: join(images, `consumer-${browserName}.png`), fullPage: true });
      await page.getByRole('button', { name: '開閉' }).click();
      await expect(page.getByRole('note')).toHaveCount(0);
      assert.deepEqual(errors, []);
    } finally {
      await browser?.close();
      await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    }
    console.log(`Installed production app: ${browserName} smoke passed`);
  }
  console.log(`Consumer checks passed: react-fukidashi@${pkg.version}, React ${exact('react')}`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
