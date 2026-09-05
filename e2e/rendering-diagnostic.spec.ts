import { test } from '@playwright/test';

test('diagnose inline shaping options', async ({ page }, info) => {
  await page.goto('/typewriter.html');
  const results = await page.evaluate(() => {
    const options = [
      ['', ''],
      ['font-kerning:normal', ''],
      ['font-feature-settings:"kern" 1,"liga" 1', ''],
      ['text-rendering:optimizeLegibility', ''],
      ['', 'display:contents'],
      ['font-kerning:normal', 'display:contents'],
      ['font-kerning:none', ''],
    ];
    const results = [];
    for (const text of ['office AVATAR affinity waffle', 'The quick brown fox', 'مرحبا بالعالم']) {
      for (const [parentStyle, childStyle] of options) {
        const wrapper = document.createElement('div');
        const plain = document.createElement('span');
        const split = document.createElement('span');
        plain.style.cssText = split.style.cssText = `display:inline-block;font:20px/1.4 Arial,sans-serif;white-space:pre;${parentStyle}`;
        plain.textContent = text;
        for (const { segment } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) {
          const el = document.createElement('span');
          el.style.cssText = childStyle!;
          el.textContent = segment;
          split.append(el);
        }
        wrapper.append(plain, document.createElement('br'), split);
        document.body.append(wrapper);
        results.push({ text, parentStyle, childStyle, plain: plain.getBoundingClientRect().width, split: split.getBoundingClientRect().width });
        wrapper.remove();
      }
    }
    return results;
  });
  await info.attach('shaping-options', { body: JSON.stringify(results), contentType: 'application/json' });
});
