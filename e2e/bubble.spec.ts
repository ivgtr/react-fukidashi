import { expect, test } from '@playwright/test';

test('playground supports skip, replay, themes and a desktop screenshot', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ことばに、表情を。' })).toBeVisible();
  await page.getByRole('button', { name: '全文表示', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('お話し完了');
  await page.getByRole('button', { name: '再生し直す' }).click();
  await expect(page.getByRole('status')).toHaveText('お話し中…');
  await page.getByRole('button', { name: '一時停止', exact: true }).click();
  const visible = page.locator('.fukidashi-positioner .fukidashi-typewriter-visible');
  const paused = await visible.textContent();
  await page.waitForTimeout(200);
  expect(await visible.textContent()).toBe(paused);
  await page.getByLabel('テーマ').selectOption('dark');
  await expect(page.locator('.fukidashi-positioner .fukidashi-bubble')).toHaveAttribute(
    'data-variant',
    'dark',
  );
  await page.screenshot({ path: testInfo.outputPath('playground-desktop.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('mobile layout does not overflow and honors reduced motion', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('お話し完了');
  await expect(page.locator('.fukidashi-positioner .fukidashi-motion')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const box = await page.locator('.fukidashi-positioner').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath('playground-mobile.png'), fullPage: true });
});

for (const side of ['top', 'right', 'bottom', 'left'] as const) {
  for (const align of ['', '-start', '-end']) {
    test(`positions ${side}${align} with a matching tail`, async ({ page }) => {
      await page.goto('/fixture.html');
      await page.getByLabel('Placement', { exact: true }).selectOption(`${side}${align}`);
      const positioner = page.locator('.fukidashi-positioner');
      await expect(positioner).toHaveAttribute('data-placement', `${side}${align}`);
      await expect(page.locator('.fukidashi-motion')).toHaveCSS('opacity', '1');
      const bubble = await page.getByTestId('bubble').boundingBox();
      const anchor = await page.getByTestId('anchor').boundingBox();
      expect(bubble).not.toBeNull();
      expect(anchor).not.toBeNull();
      if (side === 'top') expect(bubble!.y + bubble!.height).toBeLessThan(anchor!.y);
      if (side === 'bottom') expect(bubble!.y).toBeGreaterThan(anchor!.y + anchor!.height);
      if (side === 'left') expect(bubble!.x + bubble!.width).toBeLessThan(anchor!.x);
      if (side === 'right') expect(bubble!.x).toBeGreaterThan(anchor!.x + anchor!.width);
      const opposite = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };
      await expect(page.locator('.fukidashi-tail')).toHaveAttribute('data-side', opposite[side]);
    });
  }
}

test('flips and shifts at the viewport edge, and contains tall content', async ({ page }) => {
  await page.goto('/fixture.html');
  await page.getByRole('button', { name: 'Move to edge' }).click();
  const positioner = page.locator('.fukidashi-positioner');
  await expect(positioner).toHaveAttribute('data-placement', /^bottom/);
  await expect
    .poll(async () => (await positioner.boundingBox())?.x ?? -1)
    .toBeGreaterThanOrEqual(11);
  await page.getByRole('button', { name: 'Resize content' }).click();
  await expect
    .poll(async () => {
      const box = await positioner.boundingBox();
      return box ? box.y + box.height : 9999;
    })
    .toBeLessThanOrEqual(720);
});

test('keeps exit animation, blocks exiting focus targets, and cancels stale exits', async ({
  page,
}) => {
  await page.goto('/fixture.html');
  await expect(page.locator('.fukidashi-motion')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Toggle', exact: true }).click();
  const positioner = page.locator('.fukidashi-positioner');
  await expect(positioner).toHaveAttribute('inert', '');
  await expect(positioner).toHaveAttribute('aria-hidden', 'true');
  await page.getByRole('button', { name: 'Toggle', exact: true }).click();
  await expect(page.locator('.fukidashi-motion')).toHaveCSS('opacity', '1');
  await expect(page.getByLabel('Exits')).toHaveText('0');
  await page.getByRole('button', { name: 'Toggle', exact: true }).click();
  await expect(positioner).toHaveCount(0);
  await expect(page.getByLabel('Exits')).toHaveText('1');
});
