from pathlib import Path
import json

def replace(path, old, new):
    p = Path(path)
    text = p.read_text()
    assert old in text, f'Missing expected source in {path}: {old[:80]}'
    p.write_text(text.replace(old, new))

replace('src/style.css', '.fukidashi-typewriter {\n', '.fukidashi-typewriter {\n  position: relative;\n')
replace('src/style.css', '''.fukidashi-typewriter-space,
.fukidashi-typewriter-visible {
  grid-area: 1 / 1;
  min-width: 0;
}
.fukidashi-typewriter-space {
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}
.fukidashi-typewriter-visible {
  align-self: start;
}
''', '''.fukidashi-typewriter-visible {
  grid-area: 1 / 1;
  min-width: 0;
  align-self: start;
}
.fukidashi-character {
  position: relative;
}
.fukidashi-character[data-visible='false'] {
  visibility: hidden;
}
/* Position the cursor at the next grapheme without inserting a line-break
   opportunity into the text. It remains visible inside an unrevealed span. */
.fukidashi-character > .fukidashi-cursor {
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  visibility: visible;
}
''')
replace('src/style.css', '.fukidashi-cursor {\n  display:', '.fukidashi-cursor {\n  pointer-events: none;\n  -webkit-user-select: none;\n  user-select: none;\n  display:')
replace('src/style.css', '.fukidashi-sr-only {\n  position:', '.fukidashi-sr-only {\n  -webkit-user-select: none;\n  user-select: none;\n  position:')
replace('test/components.test.tsx', '''    expect(
      container.querySelector('.fukidashi-typewriter-space')?.getAttribute('aria-hidden'),
    ).toBe('true');''', '''    expect(container.querySelector('.fukidashi-typewriter-space')).toBeNull();
    expect(container.querySelectorAll('.fukidashi-character')).toHaveLength(7);
    expect(container.querySelectorAll('.fukidashi-character[data-visible="true"]')).toHaveLength(0);''')
replace('e2e/bubble.spec.ts', 'const paused = await visible.textContent();', '''const revealed = visible.locator('.fukidashi-character[data-visible="true"]');
  const paused = await revealed.allTextContents();''')
replace('e2e/bubble.spec.ts', 'expect(await visible.textContent()).toBe(paused);', 'expect(await revealed.allTextContents()).toEqual(paused);')
replace('e2e/bubble.spec.ts', 'const full = await visible.textContent();', '''const revealed = visible.locator('.fukidashi-character[data-visible="true"]');
  const full = await revealed.allTextContents();''')
replace('e2e/bubble.spec.ts', 'expect(await visible.textContent()).toBe(full);', 'expect(await revealed.allTextContents()).toEqual(full);')
replace('playwright.config.ts', "projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],", """projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],""")
replace('.github/workflows/ci.yml', '      - run: npm run check\n', '      - run: npm run check\n      - run: npm run test:consumer\n')
replace('.github/workflows/ci.yml', '''  browser:
    runs-on: ubuntu-latest
    timeout-minutes: 10''', '''  browser:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]''')
replace('.github/workflows/ci.yml', 'npx playwright install --with-deps chromium', 'npx playwright install --with-deps ${{ matrix.browser }}')
replace('.github/workflows/ci.yml', '      - run: npm run test:e2e', '      - run: npm run test:e2e -- --project=${{ matrix.browser }}\n      - run: npm run test:consumer -- --browser=${{ matrix.browser }}')
replace('.github/workflows/ci.yml', 'name: browser-report', 'name: browser-report-${{ matrix.browser }}')
replace('README.md', '以下はv2のAPIです。開発版を試すには [Development](#development) を参照してください。React / React DOM 18.3.1以降の18系、または19系に対応しています。', '''```sh
npm install react-fukidashi
```

React / React DOM 18.3.1以降の18系、または19系に対応しています。''')
replace('API.md', '全文相当の領域を確保し、文字送りによるレイアウトの跳ねを抑えます。既定は `true`。', '全文を書記素ごとのインライン要素として配置し、折り返し位置を保ったまま順に表示します。既定は `true`。`false` は表示済み文字だけでレイアウトするため、途中で折り返し位置が変わります。')
replace('API.md', 'タイマーは一つだけ使い、', '領域確保中の未表示文字とカーソルは選択・コピーの対象外です。表示済み文字は通常どおり選択できます。幅・フォントが変わった場合は通常のテキストと同様に再レイアウトされます。\n\nタイマーは一つだけ使い、')
replace('API.md', 'npx playwright install chromium', 'npx playwright install chromium firefox webkit')
replace('API.md', 'npm run test:e2e\n', 'npm run test:e2e\nnpm run test:consumer\n')
replace('API.md', '`test:e2e` はChromiumでの回帰テスト、', '`test:e2e` はChromium・Firefox・WebKitでの回帰テスト、')
replace('API.md', 'Firefox / Safari、実機スクリーンリーダーは別途確認してください。', '`test:consumer` は実際のtarballをリポジトリ外のReactアプリへインストールし、ESM/CJS・SSR・型解決・CSS・本番ビルドを確認します。CIではその本番アプリも3エンジンで描画します。WebKitの自動テストは実機Safariの確認とは異なり、実機スクリーンリーダーとともに別途確認が必要です。')
replace('MIGRATION.md', 'バージョンはまず `2.0.0-beta.0` とし、マージ後も明示的なリリースまではnpm公開されません。', 'v1を使用しているアプリでは、2.0.0への更新時に以下の変更が必要です。')
replace('CHANGELOG.md', '## 2.0.0-beta.0 — unreleased', '''## 2.0.0 — unreleased

- Fix typewriter word wrapping: lay out the complete text once and reveal graphemes without moving already-visible characters.
- Preserve native text shaping, selection of revealed text, accessible full text and the growing-layout opt-out.
- Run browser regressions and installed production-app smoke checks in Chromium, Firefox and WebKit.
- Install actual npm tarballs in isolated React 18/19 consumers; check ESM/CJS, SSR, Bundler/NodeNext types, CSS and production builds.
- Include API.md in the package, restore the normal installation command and prepare stable release metadata.

## 2.0.0-beta.2 — 2026-09-06

- Publish the v2 beta with npm Trusted Publishing (OIDC) and provenance.
- Validate package/lockfile versions and explain release-tag mismatches.

### Breaking changes introduced in v2''')
replace('PUBLISHING.md', '次は `2.0.0-beta.2` を公開する例です。', '次は正式版 `2.0.0` を公開する例です。')
replace('PUBLISHING.md', 'すべて `2.0.0-beta.2` に揃えます', 'すべて `2.0.0` に揃えます')
replace('PUBLISHING.md', 'mainの `package.json` が `2.0.0-beta.2`', 'mainの `package.json` が `2.0.0`')
replace('PUBLISHING.md', '**新規タグ `v2.0.0-beta.2`、Target `main`**', '**新規タグ `v2.0.0`、Target `main`**')
replace('PUBLISHING.md', '既存の `v2.0.0-beta.0` / `v2.0.0-beta.1` は選びません。', '既存のベータ版タグは選びません。')
replace('PUBLISHING.md', 'ベータ版なので **Set as a pre-release** を選び、', '正式版なので **Set as a pre-release** はオフにして、')
replace('PUBLISHING.md', 'npm version 2.0.0-beta.2', 'npm version 2.0.0')
replace('PUBLISHING.md', 'npm view react-fukidashi@2.0.0-beta.2 version', 'npm view react-fukidashi@2.0.0 version')
replace('PUBLISHING.md', 'npm install react-fukidashi@beta', 'npm install react-fukidashi')
replace('PUBLISHING.md', 'npm ci\nnpm run check\n```', 'npm ci\nnpm run check\nnpm run test:consumer\n```')
replace('PUBLISHING.md', '今回の復旧では、バージョン更新を含むPRをマージしてから、上の手順で新しい `v2.0.0-beta.2` をmainから作成してください。', 'この不一致は `v2.0.0-beta.2` で修正して公開済みです。以降もコードの修正が必要な場合は、修正・バージョン更新を含むPRをマージしてから新しいタグを作成してください。')
replace('PUBLISHING.md', '2. 更新した2ファイルのPRを作成し、CI成功を確認してmainへマージします。', '2. PRを作成し、React 18/19の検証・配布物導入とChromium/Firefox/WebKitの全CI成功を確認してmainへマージします。')
replace('scripts/check-package.mjs', "  'dist/index.js',", "  'API.md',\n  'MIGRATION.md',\n  'dist/index.js',")
replace('scripts/check-package.mjs', '/^(demo|test|e2e|src)\\//', '/^(demo|test|e2e|src|fixtures)\\//')
p = Path('package.json')
d = json.loads(p.read_text())
d['scripts']['test:consumer'] = 'npm run build && node scripts/check-consumer.mjs'
d['files'].append('API.md')
p.write_text(json.dumps(d, indent=2) + '\n')
