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
assert.ok(
  !browserName || ['chromium', 'firefox', 'webkit'].includes(browserName),
  'Unknown browser',
);
const temporary = mkdtempSync(join(tmpdir(), 'react-fukidashi-consumer-'));
let app;
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(command, args, cwd = app, capture = false) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    shell: process.platform === 'win32' && command === npm,
    env: { ...process.env, NODE_PATH: '', EXPECTED_VERSION: pkg.version },
    timeout: 180000,
  });
}

try {
  // A real tarball installed OUTSIDE the checkout: no workspaces, aliases,
  // symlinks or ancestor node_modules can conceal missing published files.
  const [pack] = JSON.parse(
    run(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root, true),
  );
  for (const [reactVersion, typesVersion] of [
    ['18.3.1', '18'],
    ['19.2.8', '19'],
  ]) {
    app = join(temporary, `react-${reactVersion}`);
    cpSync(join(root, 'fixtures/consumer'), app, { recursive: true });
    cpSync(join(app, 'types.mts'), join(app, 'types.cts'));
    const exact = (name) =>
      JSON.parse(readFileSync(require.resolve(`${name}/package.json`), 'utf8')).version;
    writeFileSync(
      join(app, 'package.json'),
      JSON.stringify(
        {
          name: 'isolated-consumer',
          private: true,
          type: 'module',
          dependencies: {
            'react-fukidashi': `file:${join(temporary, pack.filename)}`,
            react: reactVersion,
            'react-dom': reactVersion,
          },
          devDependencies: Object.fromEntries(
            ['@types/react', '@types/react-dom', '@types/node', 'typescript', 'vite'].map(
              (name) => [name, name.startsWith('@types/react') ? typesVersion : exact(name)],
            ),
          ),
        },
        null,
        2,
      ),
    );
    run(npm, ['install', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund']);
    run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
    run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.nodenext.json']);
    run(process.execPath, ['check-node.mjs']);
    run(process.execPath, ['node_modules/vite/bin/vite.js', 'build']);
    run(process.execPath, [
      'node_modules/vite/bin/vite.js',
      'build',
      '--ssr',
      'app.tsx',
      '--outDir',
      'ssr',
    ]);
    run(process.execPath, ['render-html.mjs']);

    if (browserName) {
      const consumerRequire = createRequire(join(app, 'package.json'));
      const { preview } = await import(pathToFileURL(consumerRequire.resolve('vite')).href);
      const playwright = await import('@playwright/test');
      const { expect } = playwright;
      const server = await preview({
        root: app,
        configFile: false,
        preview: { host: '127.0.0.1', port: 0 },
      });
      let browser;
      try {
        const address = server.httpServer.address();
        assert.ok(address && typeof address !== 'string');
        browser = await playwright[browserName].launch();
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
        await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
        await page.goto(`http://127.0.0.1:${address.port}`);
        await expect(page.locator('main > .fukidashi-bubble')).toHaveCSS('border-top-width', '2px');
        await expect(page.locator('main > .fukidashi-bubble')).toHaveCSS(
          'background-color',
          'rgb(255, 241, 191)',
        );
        const typing = page.getByTestId('typing');
        await expect(typing.locator('.fukidashi-typewriter-visible')).toHaveAttribute(
          'data-reveal-ready',
          '',
        );
        assert.equal(await page.locator('#root').getAttribute('data-hydration-error'), null);
        assert.equal(
          await page.evaluate(() => {
            const { bubble, text } = window.serverNodes;
            return (
              bubble === document.querySelector('.fukidashi-bubble') &&
              text === document.querySelector('.fukidashi-typewriter-visible').firstChild
            );
          }),
          true,
          'Hydration must retain the server DOM, including the shaped text node',
        );
        await page.getByRole('button', { name: 'Start', exact: true }).dispatchEvent('click');
        await expect(typing).toHaveAttribute('data-status', 'typing');
        for (let count = 1; count <= 4; count++) {
          await page.clock.runFor(40);
          await expect(typing).toHaveAttribute('data-visible-length', String(count));
        }
        await page.getByRole('button', { name: 'Pause', exact: true }).dispatchEvent('click');
        await expect(typing).toHaveAttribute('data-status', 'paused');
        await page.clock.runFor(200);
        await expect(typing).toHaveAttribute('data-visible-length', '4');
        await page.getByRole('button', { name: 'Resume', exact: true }).dispatchEvent('click');
        await page.clock.runFor(40);
        await expect(typing).toHaveAttribute('data-visible-length', '5');
        await page.getByRole('button', { name: '全文表示' }).dispatchEvent('click');
        await expect(page.getByLabel('Playback')).toHaveText('complete');
        await page.getByRole('button', { name: '開閉' }).dispatchEvent('click');
        await page.clock.runFor(250);
        await expect(page.getByRole('note')).toBeVisible();
        await expect(page.locator('.fukidashi-motion')).toHaveCSS('opacity', '1');
        await expect(page.getByRole('note')).toContainText('インストールしたパッケージです。');
        const images = join(root, 'test-results');
        mkdirSync(images, { recursive: true });
        await page.screenshot({
          path: join(images, `consumer-react-${reactVersion}-${browserName}.png`),
          fullPage: true,
        });
        await page.getByRole('button', { name: '開閉' }).dispatchEvent('click');
        await page.clock.runFor(250);
        await expect(page.getByRole('note')).toHaveCount(0);
        await page.getByRole('button', { name: 'Reset', exact: true }).dispatchEvent('click');
        await expect(typing).toHaveAttribute('data-visible-length', '0');
        await page.clock.runFor(40);
        await expect(typing).toHaveAttribute('data-visible-length', '1');
        assert.deepEqual(errors, []);
      } finally {
        await browser?.close();
        await new Promise((resolve, reject) =>
          server.httpServer.close((error) => (error ? reject(error) : resolve())),
        );
      }
      console.log(`Installed production app: ${browserName} smoke passed`);
    }
    console.log(`Consumer checks passed: react-fukidashi@${pkg.version}, React ${reactVersion}`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
