import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const compiler = require.resolve('typescript/bin/tsc');
rmSync('dist', { recursive: true, force: true });
for (const config of ['tsconfig.build.json', 'tsconfig.cjs.json']) {
  execFileSync(process.execPath, [compiler, '-p', config], { stdio: 'inherit' });
}
mkdirSync('dist/cjs', { recursive: true });
writeFileSync('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }) + '\n');
cpSync('src/style.css', 'dist/style.css');
