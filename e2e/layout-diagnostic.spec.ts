import { test } from '@playwright/test';

test('temporary cross-engine layout diagnosis', async ({ page }, testInfo) => {
  await page.goto('/typewriter.html');
  const results = await page.evaluate(() => {
    const samples = [
      '「そうですね。」今日は、何をしましょうか？',
      'مرحبا بالعالم React 19 أهلا وسهلا',
      'The quick brown fox jumps over the lazy dog.',
    ];
    const results = [];
    for (const sample of samples) {
      for (const mode of ['moving', 'permanent', 'none']) {
        for (const display of ['inline-grid', 'inline-block']) {
          for (const hiding of ['visibility', 'opacity']) {
            const box = document.createElement('div');
            Object.assign(box.style, { width: '180px', font: '20px/1.4 Arial,sans-serif' });
            box.dir = sample.includes('مرحبا') ? 'rtl' : 'ltr';
            const root = document.createElement('span');
            root.className = 'fukidashi-typewriter';
            root.style.display = display;
            const visual = document.createElement('span');
            visual.className = 'fukidashi-typewriter-visible';
            const spans = [
              ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(sample),
            ].map(({ segment }) => {
              const el = document.createElement('span');
              el.className = 'fukidashi-character';
              el.textContent = segment;
              if (mode === 'permanent') {
                const caret = document.createElement('span');
                caret.className = 'fukidashi-cursor';
                caret.textContent = '▍';
                caret.style.visibility = 'hidden';
                el.append(caret);
              }
              visual.append(el);
              return el;
            });
            root.append(visual);
            box.append(root);
            document.body.append(box);
            const cursor = document.createElement('span');
            cursor.className = 'fukidashi-cursor';
            cursor.textContent = '▍';
            const reveal = (count: number) => {
              spans.forEach((el, index) => {
                el.style[hiding as 'visibility' | 'opacity'] =
                  hiding === 'visibility'
                    ? index < count
                      ? 'visible'
                      : 'hidden'
                    : index < count
                      ? '1'
                      : '0';
                if (mode === 'permanent')
                  (el.lastChild as HTMLElement).style.visibility =
                    index === count ? 'visible' : 'hidden';
              });
              if (mode === 'moving') {
                cursor.remove();
                spans[count]?.append(cursor);
              }
            };
            const measure = () => {
              const origin = root.getBoundingClientRect();
              return spans.map((el) => {
                const range = document.createRange();
                range.selectNodeContents(el.firstChild!);
                const r = range.getBoundingClientRect();
                return { x: r.x - origin.x, y: r.y - origin.y };
              });
            };
            reveal(0);
            const baseline = measure();
            let maxX = 0;
            let maxY = 0;
            for (let count = 1; count <= spans.length; count++) {
              reveal(count);
              const current = measure();
              for (let i = 0; i < count; i++) {
                maxX = Math.max(maxX, Math.abs(current[i]!.x - baseline[i]!.x));
                maxY = Math.max(maxY, Math.abs(current[i]!.y - baseline[i]!.y));
              }
            }
            const final = measure();
            const actualHeight = root.getBoundingClientRect().height;
            const plain = document.createElement('span');
            plain.textContent = sample;
            visual.replaceChildren(plain);
            const plainOrigin = root.getBoundingClientRect();
            let maxFinalX = 0;
            let maxFinalY = 0;
            const plainPositions = [
              ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(sample),
            ].map(({ index, segment }, i) => {
              const range = document.createRange();
              range.setStart(plain.firstChild!, index);
              range.setEnd(plain.firstChild!, index + segment.length);
              const r = range.getBoundingClientRect();
              maxFinalX = Math.max(maxFinalX, Math.abs(r.x - plainOrigin.x - final[i]!.x));
              maxFinalY = Math.max(maxFinalY, Math.abs(r.y - plainOrigin.y - final[i]!.y));
              return r.x - plainOrigin.x;
            });
            results.push({
              sample,
              mode,
              display,
              hiding,
              maxX,
              maxY,
              maxFinalX,
              maxFinalY,
              actualHeight,
              plainHeight: plainOrigin.height,
              final,
              plainPositions,
            });
            box.remove();
          }
        }
      }
    }
    return results;
  });
  await testInfo.attach('layout-diagnosis', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
});
