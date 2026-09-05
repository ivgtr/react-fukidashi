'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { characterDelay, nonNegative, normalizeText, segmentText } from '../text.js';
import type { TypewriterOptions, TypewriterResult } from '../types.js';
import { useReducedMotion } from './useReducedMotion.js';

interface Run { source: string; id: number; count: number; manuallyPaused: boolean }
interface Wait { source: string; id: number; count: number; duration: number; remaining: number }

/** A single cancellable timer. Text identity is based on content, not array or
 * callback identity. Pausing preserves the remaining portion of the interval. */
export function useTypewriter({
  text: input, speed = 35, startDelay = 0, lineDelay = 250, punctuationDelay = 140,
  paused = false, disabled = false, reducedMotion = 'system', onComplete,
}: TypewriterOptions): TypewriterResult {
  const text = normalizeText(input);
  const characters = useMemo(() => segmentText(text), [text]);
  const reduced = useReducedMotion(reducedMotion);
  const interval = nonNegative(speed, 35);
  const initialWait = nonNegative(startDelay, 0);
  const newlineWait = nonNegative(lineDelay, 250);
  const punctuationWait = nonNegative(punctuationDelay, 140);
  const instant = disabled || reduced || interval === 0;
  const [run, setRun] = useState<Run>({ source: text, id: 0, count: 0, manuallyPaused: false });
  // Reset during render so a new source can never briefly display the old text.
  if (run.source !== text) {
    setRun({ source: text, id: run.id + 1, count: 0, manuallyPaused: false });
  }
  const wait = useRef<Wait | null>(null);
  const completeCallback = useRef(onComplete);
  const completed = useRef<{ source: string; id: number } | null>(null);
  useEffect(() => { completeCallback.current = onComplete; }, [onComplete]);

  const count = instant ? characters.length : Math.min(run.count, characters.length);
  const isComplete = count === characters.length;
  const isPaused = paused || run.manuallyPaused;

  useEffect(() => {
    if (run.source !== text) return;
    if (instant) {
      if (run.count !== characters.length) setRun(current => ({ ...current, count: characters.length }));
      return;
    }
    if (isComplete || isPaused) return;
    const duration = characterDelay(characters, run.count, interval, initialWait, newlineWait, punctuationWait);
    let pending = wait.current;
    if (!pending || pending.source !== text || pending.id !== run.id || pending.count !== run.count) {
      pending = { source: text, id: run.id, count: run.count, duration, remaining: duration };
      wait.current = pending;
    } else if (pending.duration !== duration) {
      pending.remaining = Math.max(0, pending.remaining + duration - pending.duration);
      pending.duration = duration;
    }
    const active = pending;
    const started = performance.now();
    const timer = setTimeout(() => {
      wait.current = null;
      setRun(current => current.source === text && current.id === run.id && current.count === run.count
        ? { ...current, count: current.count + 1 } : current);
    }, active.remaining);
    return () => {
      clearTimeout(timer);
      if (wait.current === active) {
        active.remaining = Math.max(0, active.remaining - (performance.now() - started));
      }
    };
  }, [text, characters, run.source, run.id, run.count, instant, isComplete, isPaused,
    interval, initialWait, newlineWait, punctuationWait]);

  useEffect(() => {
    if (run.source !== text || !isComplete) return;
    if (completed.current?.source === text && completed.current.id === run.id) return;
    completed.current = { source: text, id: run.id };
    completeCallback.current?.();
  }, [text, run.source, run.id, isComplete]);

  const pause = useCallback(() => setRun(current => ({ ...current, manuallyPaused: true })), []);
  const resume = useCallback(() => setRun(current => ({ ...current, manuallyPaused: false })), []);
  const skip = useCallback(() => setRun(current => ({ ...current, count: characters.length })), [characters.length]);
  const reset = useCallback(() => {
    wait.current = null;
    setRun(current => ({ source: text, id: current.id + 1, count: 0, manuallyPaused: false }));
  }, [text]);

  return {
    text, visibleText: characters.slice(0, count).join(''),
    progress: characters.length === 0 ? 1 : count / characters.length,
    status: isComplete ? 'complete' : isPaused ? 'paused' : 'typing',
    isComplete, pause, resume, skip, reset,
  };
}
