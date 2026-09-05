'use client';

import { useSyncExternalStore } from 'react';
import type { ReducedMotion } from '../types.js';

const query = '(prefers-reduced-motion: reduce)';
const serverSnapshot = () => false;
const getSnapshot = () => typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

function subscribe(notify: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

export function useReducedMotion(preference: ReducedMotion = 'system'): boolean {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  return preference === 'always' || (preference === 'system' && reduced);
}
