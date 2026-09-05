import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTypewriter } from '../src/hooks/useTypewriter.js';

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

beforeEach(() =>
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date'] }),
);
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useTypewriter', () => {
  it('types whole graphemes and completes only after the final one', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTypewriter({ text: 'あ👩🏽‍💻', speed: 40, onComplete }));
    expect(result.current.visibleText).toBe('');
    advance(39);
    expect(result.current.visibleText).toBe('');
    advance(1);
    expect(result.current.visibleText).toBe('あ');
    expect(onComplete).not.toHaveBeenCalled();
    advance(40);
    expect(result.current.visibleText).toBe('あ👩🏽‍💻');
    expect(result.current.progress).toBe(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it('retains the remaining delay when paused and resumed', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'abc', speed: 100 }));
    advance(40);
    act(() => result.current.pause());
    advance(1000);
    expect(result.current.visibleText).toBe('');
    expect(result.current.status).toBe('paused');
    act(() => result.current.resume());
    advance(59);
    expect(result.current.visibleText).toBe('');
    advance(1);
    expect(result.current.visibleText).toBe('a');
  });
  it('supports controlled pausing without resume overriding the owner', () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useTypewriter({ text: 'ab', speed: 20, paused }),
      { initialProps: { paused: true } },
    );
    act(() => result.current.resume());
    advance(100);
    expect(result.current.visibleText).toBe('');
    rerender({ paused: false });
    advance(20);
    expect(result.current.visibleText).toBe('a');
  });
  it('cancels pending text when the source changes', () => {
    const onComplete = vi.fn();
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter({ text, speed: 20, startDelay: 100, onComplete }),
      { initialProps: { text: 'old' } },
    );
    advance(60);
    rerender({ text: '新' });
    expect(result.current.visibleText).toBe('');
    advance(119);
    expect(result.current.visibleText).toBe('');
    advance(1);
    expect(result.current.visibleText).toBe('新');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it('does not restart for an equivalent array or a new callback identity', () => {
    const callbacks = [vi.fn(), vi.fn()];
    const { result, rerender } = renderHook(
      ({ onComplete }) => useTypewriter({ text: ['ab'], speed: 20, onComplete }),
      { initialProps: { onComplete: callbacks[0] } },
    );
    advance(20);
    rerender({ onComplete: callbacks[1] });
    advance(20);
    expect(result.current.visibleText).toBe('ab');
    expect(callbacks[0]).not.toHaveBeenCalled();
    expect(callbacks[1]).toHaveBeenCalledTimes(1);
  });
  it('skip completes once and reset starts a new run', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTypewriter({ text: 'ab', speed: 20, onComplete }));
    act(() => result.current.skip());
    act(() => result.current.skip());
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.reset());
    expect(result.current.visibleText).toBe('');
    advance(20);
    advance(20);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
  it('cancels even the initial delay without completing on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = renderHook(() =>
      useTypewriter({ text: 'ab', startDelay: 500, onComplete }),
    );
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    advance(1000);
    expect(onComplete).not.toHaveBeenCalled();
  });
  it('is safe under StrictMode setup/cleanup replay', () => {
    const onComplete = vi.fn();
    const { result, unmount } = renderHook(
      () => useTypewriter({ text: 'ab', speed: 20, onComplete }),
      { wrapper: StrictMode },
    );
    expect(vi.getTimerCount()).toBe(1);
    advance(20);
    advance(20);
    expect(result.current.visibleText).toBe('ab');
    expect(onComplete).toHaveBeenCalledTimes(1);
    unmount();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it.each([{ speed: 0 }, { disabled: true }, { reducedMotion: 'always' as const }])(
    'reveals immediately for %j',
    (option) => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useTypewriter({ text: '日本語', onComplete, ...option }));
      expect(result.current.visibleText).toBe('日本語');
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it('treats an empty message as a completed run', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTypewriter({ text: '', onComplete }));
    expect(result.current.progress).toBe(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it('changes speed without discarding the already revealed text', () => {
    const { result, rerender } = renderHook(({ speed }) => useTypewriter({ text: 'abc', speed }), {
      initialProps: { speed: 100 },
    });
    advance(100);
    advance(40);
    rerender({ speed: 50 });
    expect(result.current.visibleText).toBe('a');
    advance(10);
    expect(result.current.visibleText).toBe('ab');
  });
  it('honors start, punctuation and line delays', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'a。\nb',
        speed: 10,
        startDelay: 50,
        punctuationDelay: 100,
        lineDelay: 200,
      }),
    );
    advance(59);
    expect(result.current.visibleText).toBe('');
    advance(1);
    advance(10);
    expect(result.current.visibleText).toBe('a。');
    advance(109);
    expect(result.current.visibleText).toBe('a。');
    advance(1);
    expect(result.current.visibleText).toBe('a。\n');
    advance(209);
    expect(result.current.isComplete).toBe(false);
    advance(1);
    expect(result.current.isComplete).toBe(true);
  });
});
