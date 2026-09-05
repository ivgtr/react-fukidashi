import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Typewriter, type TypewriterControls } from '../src/index.js';

afterEach(() => vi.useRealTimers());

it('keeps full grapheme nodes in place, revealing them without changing the text layout', () => {
  vi.useFakeTimers();
  const ref = createRef<TypewriterControls>();
  const text = 'か\u3099👩🏽‍💻\nAB';
  const { container } = render(
    <Typewriter ref={ref} text={text} speed={100} lineDelay={0} punctuationDelay={0} cursor="▍" />,
  );
  const nodes = [...container.querySelectorAll('.fukidashi-character')];
  expect(nodes).toHaveLength(5);
  expect(nodes.map((node) => node.firstChild?.textContent)).toEqual([
    'か\u3099',
    '👩🏽‍💻',
    '\n',
    'A',
    'B',
  ]);
  act(() => vi.advanceTimersByTime(100));
  expect(nodes[0]?.getAttribute('data-visible')).toBe('true');
  expect(nodes[1]?.getAttribute('data-visible')).toBe('false');
  expect(nodes[1]?.querySelector('.fukidashi-cursor')).not.toBeNull();
  act(() => ref.current?.skip());
  expect([...container.querySelectorAll('.fukidashi-character')]).toEqual(nodes);
  expect(nodes.every((node) => node.getAttribute('data-visible') === 'true')).toBe(true);
  expect(container.querySelectorAll('.fukidashi-sr-only')).toHaveLength(1);
  act(() => ref.current?.reset());
  expect(nodes.every((node) => node.getAttribute('data-visible') === 'false')).toBe(true);
});

it('preserves the growing-text opt-out and can toggle reserved layout during playback', () => {
  vi.useFakeTimers();
  const { container, rerender } = render(
    <Typewriter text="ABC" speed={100} reserveSpace={false} />,
  );
  act(() => vi.advanceTimersByTime(100));
  expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe('A');
  expect(container.querySelector('.fukidashi-character')).toBeNull();
  rerender(<Typewriter text="ABC" speed={100} reserveSpace />);
  expect(container.querySelectorAll('.fukidashi-character')).toHaveLength(3);
  expect(container.querySelectorAll('[data-visible="true"]')).toHaveLength(1);
  rerender(<Typewriter text="ABC" speed={100} reserveSpace={false} />);
  expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe('A');
});
