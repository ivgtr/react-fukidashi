import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePresence } from '../src/hooks/usePresence.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('presence', () => {
  it('mounts, enters, retains an exiting element, then completes exactly once', () => {
    const done = vi.fn();
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 180, done), {
      initialProps: { open: true },
    });
    expect(result.current.present).toBe(true);
    advance(40);
    expect(result.current.entered).toBe(true);
    rerender({ open: false });
    expect(result.current.present).toBe(true);
    expect(result.current.entered).toBe(false);
    advance(211);
    expect(done).not.toHaveBeenCalled();
    advance(1);
    expect(result.current.present).toBe(false);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it('cancels an exit when reopened without a stale callback', () => {
    const done = vi.fn();
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 180, done), {
      initialProps: { open: true },
    });
    advance(40);
    rerender({ open: false });
    advance(80);
    rerender({ open: true });
    advance(300);
    expect(result.current.present).toBe(true);
    expect(result.current.entered).toBe(true);
    expect(done).not.toHaveBeenCalled();
  });
  it('does not finish on initial closed mount or StrictMode cleanup', () => {
    const done = vi.fn();
    const { unmount } = renderHook(() => usePresence(false, 0, done), { wrapper: StrictMode });
    advance(500);
    unmount();
    expect(done).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
