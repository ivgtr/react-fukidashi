import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Bubble, Fukidashi, Typewriter, useTypewriter } from '../src/index.js';

afterEach(() => vi.unstubAllGlobals());

it('tracks live reduced-motion changes, completes once and unsubscribes', () => {
  let matches = false;
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return matches;
    },
    addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
  }));
  const onComplete = vi.fn();
  const { result, unmount } = renderHook(
    () => useTypewriter({ text: '日本語 👩🏽‍💻', speed: 100, onComplete }),
    { wrapper: StrictMode },
  );
  expect(result.current.isComplete).toBe(false);
  act(() => {
    matches = true;
    listeners.forEach((listener) => listener());
  });
  expect(result.current.visibleText).toBe('日本語 👩🏽‍💻');
  expect(onComplete).toHaveBeenCalledTimes(1);
  act(() => {
    matches = false;
    listeners.forEach((listener) => listener());
  });
  expect(result.current.visibleText).toBe('日本語 👩🏽‍💻');
  expect(onComplete).toHaveBeenCalledTimes(1);
  unmount();
  expect(listeners.size).toBe(0);
});

it('keeps an exiting bubble inert when the portal container changes', async () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  document.body.append(first, second);
  const anchor = <button>Anchor</button>;
  const { rerender, unmount } = render(
    <Fukidashi anchor={anchor} portal={first} duration={10000}>
      Message
    </Fukidashi>,
  );
  await waitFor(() => expect(first.querySelector('.fukidashi-positioner')).not.toBeNull());
  rerender(
    <Fukidashi anchor={anchor} portal={first} duration={10000} open={false}>
      Message
    </Fukidashi>,
  );
  expect(first.querySelector('.fukidashi-positioner')?.hasAttribute('inert')).toBe(true);
  rerender(
    <Fukidashi anchor={anchor} portal={second} duration={10000} open={false}>
      Message
    </Fukidashi>,
  );
  await waitFor(() =>
    expect(second.querySelector('.fukidashi-positioner')?.hasAttribute('inert')).toBe(true),
  );
  expect(first.childElementCount).toBe(0);
  unmount();
  first.remove();
  second.remove();
});

it('hydrates server-rendered Japanese text without replacing the server DOM', async () => {
  const ui = (
    <Bubble>
      <Typewriter text={'か\u3099 👨‍👩‍👧‍👦'} paused cursor="▍" />
    </Bubble>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(ui);
  expect(container.querySelector('.fukidashi-cursor')).toBeNull();
  document.body.append(container);
  const existing = container.firstChild;
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, ui, { onRecoverableError: (error) => errors.push(error) });
  });
  expect(errors).toEqual([]);
  expect(container.firstChild).toBe(existing);
  expect(container.querySelector('.fukidashi-cursor[data-overlay]')).not.toBeNull();
  expect(container.querySelector('.fukidashi-sr-only')?.textContent).toBe('か\u3099 👨‍👩‍👧‍👦');
  act(() => root?.unmount());
  container.remove();
});
