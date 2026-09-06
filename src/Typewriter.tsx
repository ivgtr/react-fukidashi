'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode, RefObject } from 'react';
import type { TypewriterControls, TypewriterProps } from './types.js';
import { segmentText } from './text.js';
import { useTypewriter } from './hooks/useTypewriter.js';
import { observeCopy } from './copy.js';

const highlightName = 'fukidashi-unrevealed';

/** Paint a range without inserting inline boundaries into the shaped text.
 * Mount only after hydration: neither Range nor a layout effect runs in SSR. */
function TextPresentation({
  element,
  text,
  offset,
  cursor,
}: {
  element: RefObject<HTMLSpanElement | null>;
  text: string;
  offset: number;
  cursor: ReactNode;
}) {
  const caret = useRef<HTMLSpanElement>(null);
  const ends = useMemo(() => {
    let end = 0;
    return segmentText(text).map((value) => (end += value.length));
  }, [text]);
  useLayoutEffect(() => {
    const visual = element.current;
    const node = visual?.firstChild;
    const view = visual?.ownerDocument.defaultView;
    if (!visual || !node || !view) return;
    const registry = view.CSS.highlights;
    const highlight = registry.get(highlightName) ?? new view.Highlight();
    const hidden = visual.ownerDocument.createRange();
    hidden.setStart(node, offset);
    hidden.setEnd(node, text.length);
    highlight.add(hidden);
    registry.set(highlightName, highlight);
    visual.setAttribute('data-reveal-ready', '');

    const root = visual.parentElement!;
    const updateCursor = () => {
      if (!caret.current) return;
      const next = visual.ownerDocument.createRange();
      next.setStart(node, offset);
      next.setEnd(node, ends.find((end) => end > offset) ?? text.length);
      const rect = next.getBoundingClientRect?.();
      if (!rect) return;
      const origin = root.getBoundingClientRect();
      const scaleX = origin.width / (root.offsetWidth || 1) || 1;
      const scaleY = origin.height / (root.offsetHeight || 1) || 1;
      const rtl = view.getComputedStyle(visual).direction === 'rtl';
      caret.current.style.left = `${((rtl ? rect.right : rect.left) - origin.left) / scaleX - root.clientLeft}px`;
      caret.current.style.top = `${(rect.top - origin.top) / scaleY - root.clientTop}px`;
      caret.current.style.visibility = 'visible';
    };
    updateCursor();
    const observer =
      cursor && typeof view.ResizeObserver === 'function'
        ? new view.ResizeObserver(updateCursor)
        : null;
    observer?.observe(root);
    if (cursor) visual.ownerDocument.fonts?.addEventListener('loadingdone', updateCursor);
    return () => {
      observer?.disconnect();
      visual.ownerDocument.fonts?.removeEventListener('loadingdone', updateCursor);
      highlight.delete(hidden);
      // Other Typewriters (including another bundle) may share this registry.
      if (highlight.size === 0 && registry.get(highlightName) === highlight)
        registry.delete(highlightName);
      visual.removeAttribute('data-reveal-ready');
    };
  }, [element, text, offset, ends, cursor]);
  return cursor ? (
    <span ref={caret} className="fukidashi-cursor" data-overlay="true" aria-hidden="true">
      {cursor}
    </span>
  ) : null;
}

export const Typewriter = forwardRef<TypewriterControls, TypewriterProps>(function Typewriter(
  {
    text,
    speed,
    startDelay,
    lineDelay,
    punctuationDelay,
    paused,
    disabled,
    reducedMotion,
    onComplete,
    cursor = null,
    reserveSpace = true,
    className,
    ...attributes
  },
  ref,
) {
  const visual = useRef<HTMLSpanElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    const view = visual.current?.ownerDocument.defaultView;
    setSupported(Boolean(view?.CSS?.highlights && typeof view.Highlight === 'function'));
    if (visual.current) return observeCopy(visual.current.ownerDocument);
  }, []);
  const typing = useTypewriter({
    text,
    speed,
    startDelay,
    lineDelay,
    punctuationDelay,
    paused,
    disabled: disabled || (reserveSpace && supported === false),
    reducedMotion,
    onComplete,
  });
  useImperativeHandle(
    ref,
    () => ({ pause: typing.pause, resume: typing.resume, skip: typing.skip, reset: typing.reset }),
    [typing.pause, typing.resume, typing.skip, typing.reset],
  );
  return (
    <span
      {...attributes}
      className={['fukidashi-typewriter', className].filter(Boolean).join(' ')}
      data-status={typing.status}
      data-reserve-space={reserveSpace}
      data-visible-length={typing.visibleText.length}
    >
      <span className="fukidashi-sr-only">{typing.text}</span>
      <span ref={visual} className="fukidashi-typewriter-visible" aria-hidden="true">
        {reserveSpace ? typing.text : typing.visibleText}
        {!reserveSpace && !typing.isComplete && cursor && (
          <span className="fukidashi-cursor">{cursor}</span>
        )}
      </span>
      {reserveSpace && supported && !typing.isComplete && (
        <TextPresentation
          element={visual}
          text={typing.text}
          offset={typing.visibleText.length}
          cursor={cursor}
        />
      )}
    </span>
  );
});
