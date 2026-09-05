import { describe, expect, it, vi } from 'vitest';
import { characterDelay, nonNegative, normalizeText, segmentText } from '../src/text.js';

describe('text preparation', () => {
  it('normalizes arrays and all newline conventions', () => {
    expect(normalizeText(['a\r\nb', '', 'c\rd'])).toBe('a\nb\n\nc\nd');
  });
  it('keeps Japanese, combining marks, flags and joined emoji intact', () => {
    expect(segmentText('あe\u0301👩🏽‍💻🇯🇵')).toEqual(['あ', 'e\u0301', '👩🏽‍💻', '🇯🇵']);
    expect(segmentText('')).toEqual([]);
  });
  it('degrades to one intact unit without Intl.Segmenter', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'Segmenter');
    try {
      Object.defineProperty(Intl, 'Segmenter', { value: undefined, configurable: true });
      expect(segmentText('👨‍👩‍👧‍👦か\u3099')).toEqual(['👨‍👩‍👧‍👦か\u3099']);
    } finally {
      if (descriptor) Object.defineProperty(Intl, 'Segmenter', descriptor);
    }
  });
  it('adds pauses after punctuation and newlines, not before them', () => {
    const chars = ['あ', '。', '\n', '次'];
    expect(characterDelay(chars, 0, 30, 100, 200, 80)).toBe(130);
    expect(characterDelay(chars, 1, 30, 100, 200, 80)).toBe(30);
    expect(characterDelay(chars, 2, 30, 100, 200, 80)).toBe(110);
    expect(characterDelay(chars, 3, 30, 100, 200, 80)).toBe(230);
  });
  it('does not pass nonfinite or negative durations to timers', () => {
    expect(nonNegative(NaN, 35)).toBe(35);
    expect(nonNegative(Infinity, 35)).toBe(35);
    expect(nonNegative(-10, 35)).toBe(0);
  });
  it('does not use randomness to prepare text', () => {
    const random = vi.spyOn(Math, 'random');
    segmentText('deterministic');
    expect(random).not.toHaveBeenCalled();
  });
});
