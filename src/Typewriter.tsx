'use client';

import { forwardRef, useImperativeHandle } from 'react';
import type { TypewriterControls, TypewriterProps } from './types.js';
import { useTypewriter } from './hooks/useTypewriter.js';

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
      {/* Expose the message once, not a live-region update for every letter. */}
      <span className="fukidashi-sr-only">{typing.text}</span>
      {reserveSpace && (
        <span className="fukidashi-typewriter-space" aria-hidden="true">
          {typing.text}
        </span>
      )}
      <span className="fukidashi-typewriter-visible" aria-hidden="true">
        {typing.visibleText}
        {!typing.isComplete && cursor && <span className="fukidashi-cursor">{cursor}</span>}
      </span>
    </span>
  );
});
