import { expect, test } from '@playwright/test';

for (const dir of ['ltr', 'rtl']) {
  test(`cursor tracks the next grapheme through resizing and scaling: ${dir}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
    const text = dir === 'rtl' ? 'مرحبا بكم في عالم جميل' : 'The quick brown fox jumps.';
    await page.goto(`/typewriter.html?${new URLSearchParams({ dir, text })}`);
    const typing = page.getByTestId('typing');
    const cursor = typing.locator('.fukidashi-cursor[data-overlay]');
    await expect(cursor).toHaveCSS('visibility', 'visible');
    const aligned = () =>
      typing.evaluate((root) => {
        const target = root.querySelector<HTMLElement>('[data-visible="false"]')!;
        const caret = root.querySelector<HTMLElement>('[data-overlay]')!;
        const a = target.getBoundingClientRect();
        const b = caret.getBoundingClientRect();
        const rtl = getComputedStyle(target).direction === 'rtl';
        return Math.max(Math.abs(b.x - (rtl ? a.right : a.left)), Math.abs(b.y - a.y));
      });
    await expect.poll(aligned).toBeLessThan(1.1);
    await page.getByRole('button', { name: 'Start', exact: true }).dispatchEvent('click');
    await expect(typing).toHaveAttribute('data-status', 'typing');
    for (let count = 1; count <= 8; count++) {
      await page.clock.runFor(25);
      await expect(typing.locator('[data-visible="true"]')).toHaveCount(count);
    }
    await page.getByRole('button', { name: 'Pause', exact: true }).dispatchEvent('click');
    await expect(typing).toHaveAttribute('data-status', 'paused');
    await typing.evaluate((root) => {
      root.parentElement!.style.width = '90px';
      root.parentElement!.style.transform = 'scale(0.94)';
    });
    await page.clock.runFor(100);
    await expect.poll(aligned).toBeLessThan(1.1);
    await expect(typing.locator('[data-visible="true"]')).toHaveCount(8);
    await page.getByRole('button', { name: 'Skip', exact: true }).dispatchEvent('click');
    await expect(cursor).toHaveCount(0);
    await expect(page.getByLabel('Completions')).toHaveText('1');
  });
}
