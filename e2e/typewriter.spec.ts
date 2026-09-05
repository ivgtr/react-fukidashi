import { expect, test, type Page } from '@playwright/test';

async function positions(page: Page, testId = 'typing') {
  return page.getByTestId(testId).evaluate((root) => {
    const node = root.querySelector('.fukidashi-typewriter-visible')!.firstChild!;
    const origin = root.getBoundingClientRect();
    return [
      ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(node.textContent!),
    ].map(({ index, segment }) => {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + segment.length);
      const rect = range.getBoundingClientRect();
      return {
        x: rect.x - origin.x,
        y: rect.y - origin.y,
        width: rect.width,
        end: index + segment.length,
      };
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
  test(`keeps every revealed character in its native final position: ${sample.name}`, async ({
    page,
  }, info) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
    await page.goto(
      `/typewriter.html?${new URLSearchParams({ text: sample.text, width: String(sample.width), lang: sample.lang ?? 'en', dir: sample.dir ?? 'ltr' })}`,
    );
    const typing = page.getByTestId('typing');
    await expect(typing).toHaveAttribute('data-status', 'paused');
    await expect(typing.locator('.fukidashi-typewriter-visible')).toHaveAttribute(
      'data-reveal-ready',
      '',
    );
    const baseline = await positions(page);
    const reference = await positions(page, 'reference');
    const before = await typing.boundingBox();
    expect(baseline).toHaveLength(reference.length);
    await page.getByRole('button', { name: 'Start', exact: true }).dispatchEvent('click');
    await expect(typing).toHaveAttribute('data-status', 'typing');
    for (let count = 1; count <= baseline.length; count++) {
      await page.clock.runFor(25);
      const end = baseline[count - 1]!.end;
      await expect(typing).toHaveAttribute('data-visible-length', String(end));
      const current = await positions(page);
      for (let index = 0; index < count; index++) {
        // Same text node throughout playback, including kerning and ligatures.
        expect(Math.abs(current[index]!.x - baseline[index]!.x)).toBeLessThan(0.6);
        expect(Math.abs(current[index]!.y - baseline[index]!.y)).toBeLessThan(0.6);
        expect(Math.abs(current[index]!.x - reference[index]!.x)).toBeLessThan(0.6);
        expect(Math.abs(current[index]!.y - reference[index]!.y)).toBeLessThan(0.6);
        expect(Math.abs(current[index]!.width - reference[index]!.width)).toBeLessThan(0.6);
      }
      if (count < baseline.length) {
        const hidden = await typing.evaluate((root) => {
          const node = root.querySelector('.fukidashi-typewriter-visible')!.firstChild;
          const range = [...CSS.highlights.get('fukidashi-unrevealed')!].find(
            (range) => range.startContainer === node,
          ) as Range;
          return range.toString();
        });
        expect(hidden).toBe(sample.text.slice(end));
      }
      if (count === 12 && sample.name === 'English words') {
        await page.screenshot({ path: info.outputPath('typewriter-midplay.png') });
      }
    }
    await expect(typing).toHaveAttribute('data-status', 'complete');
    await expect(page.getByLabel('Completions')).toHaveText('1');
    expect(Math.abs((await typing.boundingBox())!.height - before!.height)).toBeLessThan(0.6);
    expect(await page.evaluate(() => CSS.highlights.has('fukidashi-unrevealed'))).toBe(false);
  });
}

test('copies only revealed text and exposes the full message once to assistive technology', async ({
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
    await expect(typing).toHaveAttribute('data-visible-length', String(count));
  }
  const copyText = () =>
    typing.evaluate((root) => {
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.selectAllChildren(root);
      const before = selection.toString();
      const data = new DataTransfer();
      const event = new ClipboardEvent('copy', {
        bubbles: true,
        cancelable: true,
        clipboardData: data,
      });
      root.dispatchEvent(event);
      if (selection.toString() !== before) throw new Error('Copy changed the selection');
      if (data.getData('text/html')) throw new Error('Hidden HTML leaked into the clipboard');
      return data.getData('text/plain');
    });
  expect(await copyText()).toBe('Copy');
  await expect(typing).toMatchAriaSnapshot(`- text: ${text}`);
  await page.getByRole('button', { name: 'Skip', exact: true }).dispatchEvent('click');
  await expect(typing).toHaveAttribute('data-status', 'complete');
  expect(await copyText()).toBe(text);
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

test('unsupported highlights fall back to complete text without leaving it invisible', async ({
  page,
}) => {
  await page.addInitScript(() => Object.defineProperty(window, 'Highlight', { value: undefined }));
  await page.goto('/typewriter.html');
  await expect(page.getByTestId('typing')).toHaveAttribute('data-status', 'complete');
  await expect(page.getByTestId('typing').locator('.fukidashi-typewriter-visible')).toBeVisible();
  await expect(page.getByLabel('Completions')).toHaveText('1');
});

for (const reserve of [true, false]) {
  test(`native clipboard excludes hidden text and cursor (reserveSpace=${reserve})`, async ({
    page,
  }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
    await page.goto(`/typewriter.html?text=Copy%20this%20safely.&reserve=${reserve}`);
    const typing = page.getByTestId('typing');
    await expect(typing).toHaveAttribute('data-status', 'paused');
    await page.getByRole('button', { name: 'Start', exact: true }).dispatchEvent('click');
    await expect(typing).toHaveAttribute('data-status', 'typing');
    for (let count = 1; count <= 4; count++) {
      await page.clock.runFor(25);
      await expect(typing).toHaveAttribute('data-visible-length', String(count));
    }
    await typing.evaluate((root) => {
      const field = document.createElement('textarea');
      field.id = 'paste-target';
      document.body.append(field);
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.selectAllChildren(root);
    });
    await page.keyboard.press('Control+c');
    await page.locator('#paste-target').focus();
    await page.keyboard.press('Control+v');
    await expect(page.locator('#paste-target')).toHaveValue('Copy');
  });
}

test('copy preserves a backwards selection spanning surrounding text and multiple instances', async ({
  page,
}) => {
  await page.goto('/typewriter.html?text=Hidden');
  const typing = page.getByTestId('typing');
  await expect(typing).toHaveAttribute('data-status', 'paused');
  const result = await typing.evaluate((root) => {
    const host = document.createElement('div');
    const before = document.createTextNode('Before ');
    const middle = document.createTextNode(' between ');
    const after = document.createTextNode(' after');
    // Keep the real instance mounted; add a second equivalent presentation.
    root.parentElement!.insertBefore(host, root);
    host.append(before, root, middle, root.cloneNode(true), after);
    const instances = host.querySelectorAll('.fukidashi-typewriter');
    instances[0]!.setAttribute('data-visible-length', '2');
    instances[1]!.setAttribute('data-visible-length', '3');
    const selection = window.getSelection()!;
    selection.setBaseAndExtent(after, after.length, before, 0);
    const data = new DataTransfer();
    host.dispatchEvent(
      new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: data }),
    );
    return {
      text: data.getData('text/plain'),
      restored:
        selection.anchorNode === after &&
        selection.anchorOffset === after.length &&
        selection.focusNode === before &&
        selection.focusOffset === 0,
    };
  });
  expect(result).toEqual({ text: 'Before Hi between Hid after', restored: true });
});
