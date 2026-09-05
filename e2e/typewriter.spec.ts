import { expect, test, type Page } from '@playwright/test';

async function positions(page: Page) {
  return page.getByTestId('typing').evaluate((root) => {
    const origin = root.getBoundingClientRect();
    return [...root.querySelectorAll('.fukidashi-character')].map((span) => {
      const range = document.createRange();
      range.selectNodeContents(span.firstChild!);
      const rect = range.getBoundingClientRect();
      return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width };
    });
  });
}

const cases = [
  { name: 'English words', text: 'The quick brown fox jumps over the lazy dog.', width: 180 },
  {
    name: 'Japanese punctuation',
    text: 'こんにちは。今日はどんなことをして過ごしましょうか？',
    width: 300,
    lang: 'ja',
  },
  {
    name: 'narrow Japanese',
    text: '「そうですね。」今日は、何をしましょうか？',
    width: 180,
    lang: 'ja',
  },
  { name: 'graphemes and emoji', text: 'か\u3099 e\u0301 👩🏽‍💻 👨‍👩‍👧‍👦 🇯🇵 hello!', width: 180 },
  { name: 'explicit newlines', text: '\nFirst line\n\nSecond line\n', width: 180 },
  { name: 'ligatures and kerning', text: 'office AVATAR affinity waffle', width: 180 },
  {
    name: 'RTL and mixed text',
    text: 'مرحبا بالعالم React 19 أهلا وسهلا',
    width: 180,
    dir: 'rtl',
    lang: 'ar',
  },
];

for (const sample of cases) {
  test(`keeps every revealed character in its final position: ${sample.name}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
    await page.goto(
      `/typewriter.html?${new URLSearchParams({
        text: sample.text,
        width: String(sample.width),
        lang: sample.lang ?? 'en',
        dir: sample.dir ?? 'ltr',
      })}`,
    );
    const typing = page.getByTestId('typing');
    await expect(typing).toHaveAttribute('data-status', 'paused');
    const baseline = await positions(page);
    expect(baseline.length).toBeGreaterThan(0);
    const before = await typing.boundingBox();
    await page.getByRole('button', { name: 'Start', exact: true }).dispatchEvent('click');
    await expect(typing).toHaveAttribute('data-status', 'typing');
    for (let count = 1; count <= baseline.length; count++) {
      await page.clock.runFor(25);
      await expect(typing.locator('[data-visible="true"]')).toHaveCount(count);
      const current = await positions(page);
      for (let index = 0; index < count; index++) {
        expect(
          Math.abs(current[index]!.x - baseline[index]!.x),
          `x at ${count}/${index}`,
        ).toBeLessThan(0.6);
        expect(
          Math.abs(current[index]!.y - baseline[index]!.y),
          `y at ${count}/${index}`,
        ).toBeLessThan(0.6);
      }
    }
    await expect(typing).toHaveAttribute('data-status', 'complete');
    await expect(page.getByLabel('Completions')).toHaveText('1');
    expect(Math.abs((await typing.boundingBox())!.height - before!.height)).toBeLessThan(0.6);
    // Compare whole words with ordinary text. A per-letter Range can include
    // an entire ligature in a split text node but only half in a single node.
    // WebKit also rounds text-fragment bounds differently at subpixel edges.
    const words = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="typing"]')!;
      const reference = document.querySelector('[data-testid="reference"]')!;
      const plain = reference.querySelector('.fukidashi-typewriter-visible')!.firstChild!;
      const origin = root.getBoundingClientRect();
      const refOrigin = reference.getBoundingClientRect();
      const nodes = [...root.querySelectorAll('.fukidashi-character')].map((el) => el.firstChild!);
      const locate = (offset: number, end = false) => {
        for (const node of nodes) {
          if (offset < node.textContent!.length || (end && offset === node.textContent!.length))
            return { node, offset };
          offset -= node.textContent!.length;
        }
        const node = nodes[nodes.length - 1]!;
        return { node, offset: node.textContent!.length };
      };
      return [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(plain.textContent!)]
        .filter(({ segment }) => segment.trim())
        .map(({ index, segment }) => {
          const start = locate(index);
          const end = locate(index + segment.length, true);
          const actual = document.createRange();
          actual.setStart(start.node, start.offset);
          actual.setEnd(end.node, end.offset);
          const expected = document.createRange();
          expected.setStart(plain, index);
          expected.setEnd(plain, index + segment.length);
          const a = actual.getBoundingClientRect();
          const b = expected.getBoundingClientRect();
          return {
            segment,
            x: a.x - origin.x - b.x + refOrigin.x,
            y: a.y - origin.y - b.y + refOrigin.y,
            width: a.width - b.width,
          };
        });
    });
    for (const word of words) {
      expect(Math.abs(word.x), word.segment).toBeLessThanOrEqual(1);
      expect(Math.abs(word.y), word.segment).toBeLessThanOrEqual(1);
      expect(Math.abs(word.width), word.segment).toBeLessThanOrEqual(1);
    }
  });
}

test('selection contains only revealed text, with no hidden text or cursor duplicates', async ({
  page,
}) => {
  const text = 'Copy this text safely.';
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  await page.goto(`/typewriter.html?text=${encodeURIComponent(text)}`);
  const typing = page.getByTestId('typing');
  await expect(typing).toHaveAttribute('data-status', 'paused');
  await page.getByRole('button', { name: 'Start', exact: true }).dispatchEvent('click');
  await expect(typing).toHaveAttribute('data-status', 'typing');
  for (let count = 1; count <= 4; count++) {
    await page.clock.runFor(25);
    await expect(typing.locator('[data-visible="true"]')).toHaveCount(count);
  }
  const selectText = () =>
    typing.evaluate((root) => {
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.selectAllChildren(root);
      return selection.toString();
    });
  expect(await selectText()).toBe('Copy');
  await expect(typing).toMatchAriaSnapshot(`- text: ${text}`);
  await page.getByRole('button', { name: 'Skip', exact: true }).dispatchEvent('click');
  await expect(typing).toHaveAttribute('data-status', 'complete');
  expect(await selectText()).toBe(text);
  await expect(typing).toMatchAriaSnapshot(`- text: ${text}`);
});

test('reserveSpace=false explicitly opts into growing layout', async ({ page }) => {
  await page.goto('/typewriter.html?reserve=false&cursor=false');
  const typing = page.getByTestId('typing');
  await expect(typing).toHaveAttribute('data-status', 'paused');
  const before = await typing.boundingBox();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(typing).toHaveAttribute('data-status', 'complete');
  expect((await typing.boundingBox())!.height).toBeGreaterThan(before!.height);
});
