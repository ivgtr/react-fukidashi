import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Typewriter, type TypewriterControls } from '../src/index.js';

afterEach(() => vi.useRealTimers());
const ranges = () => [...(CSS.highlights.get('fukidashi-unrevealed') ?? [])] as Range[];

it('keeps one native text node and reveals whole graphemes without changing layout', () => {
  vi.useFakeTimers();
  const ref = createRef<TypewriterControls>();
  const text = 'か\u3099👩🏽‍💻\nAB';
  const { container, unmount } = render(
    <Typewriter ref={ref} text={text} speed={100} lineDelay={0} punctuationDelay={0} />,
  );
  const visual = container.querySelector('.fukidashi-typewriter-visible')!;
  const node = visual.firstChild;
  expect(visual.childNodes.length).toBe(1);
  expect(node?.textContent).toBe(text);
  expect(ranges()[0]?.toString()).toBe(text);
  act(() => vi.advanceTimersByTime(100));
  expect(ranges()[0]?.startOffset).toBe(2);
  expect(ranges()[0]?.toString()).toBe('👩🏽‍💻\nAB');
  act(() => vi.advanceTimersByTime(100));
  expect(ranges()[0]?.toString()).toBe('\nAB');
  expect(visual.firstChild).toBe(node);
  act(() => ref.current?.skip());
  expect(ranges()).toHaveLength(0);
  expect(visual.firstChild).toBe(node);
  act(() => ref.current?.reset());
  expect(ranges()[0]?.toString()).toBe(text);
  unmount();
  expect(CSS.highlights.has('fukidashi-unrevealed')).toBe(false);
});

it('preserves growing text and can toggle reserved layout during playback', () => {
  vi.useFakeTimers();
  const { container, rerender } = render(
    <Typewriter text="ABC" speed={100} reserveSpace={false} />,
  );
  act(() => vi.advanceTimersByTime(100));
  expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe('A');
  expect(ranges()).toHaveLength(0);
  rerender(<Typewriter text="ABC" speed={100} reserveSpace />);
  expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe('ABC');
  expect(ranges()[0]?.toString()).toBe('BC');
  rerender(<Typewriter text="ABC" speed={100} reserveSpace={false} />);
  expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe('A');
  expect(ranges()).toHaveLength(0);
});

it('keeps independent ranges for multiple instances and cleans up only its own range', () => {
  const first = render(<Typewriter text="First" paused />);
  const second = render(<Typewriter text="Second" paused />);
  expect(ranges().map((range) => range.toString())).toEqual(['First', 'Second']);
  first.unmount();
  expect(ranges().map((range) => range.toString())).toEqual(['Second']);
  second.unmount();
  expect(CSS.highlights.has('fukidashi-unrevealed')).toBe(false);
});

it('shows complete text once rather than broken animation when highlights are unavailable', () => {
  vi.stubGlobal('Highlight', undefined);
  const onComplete = vi.fn();
  const { container } = render(<Typewriter text="Accessible fallback" onComplete={onComplete} />);
  expect(container.firstElementChild?.getAttribute('data-status')).toBe('complete');
  expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe(
    'Accessible fallback',
  );
  expect(onComplete).toHaveBeenCalledTimes(1);
});
