// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Bubble, Fukidashi, Typewriter } from '../src/index.js';

it('imports and renders without window, document or browser observers', () => {
  expect(
    renderToString(
      <Bubble>
        <Typewriter text="SSRでも日本語 👨‍👩‍👧‍👦" />
      </Bubble>,
    ),
  ).toContain('SSRでも日本語');
  expect(renderToString(<Fukidashi anchor={<button>Anchor</button>}>Popup</Fukidashi>)).toContain(
    'Anchor',
  );
});
