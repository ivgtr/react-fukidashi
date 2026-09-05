export function normalizeText(text: string | readonly string[]): string {
  return (typeof text === 'string' ? text : text.join('\n')).replace(/\r\n?/g, '\n');
}

/** Never split surrogate pairs, combining marks or ZWJ emoji. Older engines
 * without Segmenter reveal the entire string as one unit rather than corrupt it. */
export function segmentText(text: string): string[] {
  if (!text) return [];
  if (typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function') return [text];
  return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
    ({ segment }) => segment);
}

export function nonNegative(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function characterDelay(
  characters: readonly string[], index: number, speed: number,
  startDelay: number, lineDelay: number, punctuationDelay: number,
): number {
  if (index === 0) return startDelay + speed;
  const previous = characters[index - 1];
  return speed + (previous === '\n' ? lineDelay : /[、。，．！？!?.,;:…]/u.test(previous ?? '') ? punctuationDelay : 0);
}
