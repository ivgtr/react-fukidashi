'use client';

import { forwardRef, useImperativeHandle, useMemo } from 'react';
import type { TypewriterControls, TypewriterProps } from './types.js';
import { segmentText } from './text.js';
import { useTypewriter } from './hooks/useTypewriter.js';

export const Typewriter = forwardRef<TypewriterControls, TypewriterProps>(function Typewriter(
  { text, speed, startDelay, lineDelay, punctuationDelay, paused, disabled, reducedMotion, onComplete, cursor = null, reserveSpace = true, className, ...attributes },
  ref,
) {
  const typing = useTypewriter({ text, speed, startDelay, lineDelay, punctuationDelay, paused, disabled, reducedMotion, onComplete });
  const characters = useMemo(() => {
    let end = 0;
    return segmentText(typing.text).map((value) => {
      const start = end;
      end += value.length;
      return { value, start, end };
    });
  }, [typing.text]);
  const visibleLength = typing.visibleText.length;
  const caret = !typing.isComplete && cursor ? <span className="fukidashi-cursor">{cursor}</span> : null;
  useImperativeHandle(
    ref,
    () => ({ pause: typing.pause, resume: typing.resume, skip: typing.skip, reset: typing.reset }),
    [typing.pause, typing.resume, typing.skip, typing.reset],
  );
  return (
    <span {...attributes} className={['fukidashi-typewriter', className].filter(Boolean).join(' ')} data-status={typing.status}>
      {/* Expose the message once, not a live-region update for every letter. */}
      <span className="fukidashi-sr-only">{typing.text}</span>
      <span className="fukidashi-typewriter-visible" aria-hidden="true">
        {reserveSpace ? (
          // Keep every grapheme in the SAME inline layout throughout playback.
          // Never use inline-block here: it changes word wrapping and shaping.
          characters.map(({ value, start, end }) => (
            <span key={start} className="fukidashi-character" data-visible={end <= visibleLength}>
              {value}
              {start === visibleLength && caret}
            </span>
          ))
        ) : (
          <>{typing.visibleText}{caret}</>
        )}
      </span>
    </span>
  );
});
