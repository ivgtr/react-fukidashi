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

/** Keep the cursor out of the text's inline formatting context. Inserting even
 * an absolutely positioned child between letters can change Firefox shaping. */
function OverlayCursor({
  anchor,
  offset,
  text,
  children,
}: {
  anchor: RefObject<HTMLSpanElement | null>;
  offset: number;
  text: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const cursor = ref.current;
    const target = anchor.current;
    if (!cursor || !target) return;
    const update = () => {
      // Layout offsets stay in CSS pixels even inside an animated/scaled bubble.
      const rtl = getComputedStyle(target).direction === 'rtl';
      cursor.style.left = `${target.offsetLeft + (rtl ? target.offsetWidth : 0)}px`;
      cursor.style.top = `${target.offsetTop}px`;
      cursor.style.visibility = 'visible';
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if (cursor.parentElement) observer?.observe(cursor.parentElement);
    document.fonts?.addEventListener('loadingdone', update);
    return () => {
      observer?.disconnect();
      document.fonts?.removeEventListener('loadingdone', update);
    };
  }, [anchor, offset, text, children]);
  return (
    <span ref={ref} className="fukidashi-cursor" data-overlay="true" aria-hidden="true">
      {children}
    </span>
  );
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
  const typing = useTypewriter({
    text,
    speed,
    startDelay,
    lineDelay,
    punctuationDelay,
    paused,
    disabled,
    reducedMotion,
    onComplete,
  });
  const characters = useMemo(() => {
    let end = 0;
    return segmentText(typing.text).map((value) => {
      const start = end;
      end += value.length;
      return { value, start, end };
    });
  }, [typing.text]);
  const visibleLength = typing.visibleText.length;
  const nextCharacter = useRef<HTMLSpanElement>(null);
  const [client, setClient] = useState(false);
  // The measured cursor mounts only after hydration, so its layout effect is
  // never evaluated by the server (including React 18 renderToString).
  useEffect(() => {
    if (cursor) setClient(true);
  }, [cursor]);
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
    >
      <span className="fukidashi-sr-only">{typing.text}</span>
      <span className="fukidashi-typewriter-visible" aria-hidden="true">
        {reserveSpace ? (
          characters.map(({ value, start, end }) => (
            // Plain inline spans preserve normal word breaking and text shaping.
            <span
              key={start}
              ref={start === visibleLength ? nextCharacter : undefined}
              className="fukidashi-character"
              data-visible={end <= visibleLength}
            >
              {value}
            </span>
          ))
        ) : (
          <>
            {typing.visibleText}
            {!typing.isComplete && cursor && <span className="fukidashi-cursor">{cursor}</span>}
          </>
        )}
      </span>
      {reserveSpace && client && !typing.isComplete && cursor && (
        <OverlayCursor anchor={nextCharacter} offset={visibleLength} text={typing.text}>
          {cursor}
        </OverlayCursor>
      )}
    </span>
  );
});
