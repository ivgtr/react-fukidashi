import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has Range but no native highlight painting. Browser tests verify paint.
beforeEach(() => {
  vi.stubGlobal('Highlight', class extends Set<Range> {});
  vi.stubGlobal('CSS', { ...globalThis.CSS, highlights: new Map() });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
