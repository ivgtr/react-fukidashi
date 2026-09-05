'use client';

import { useEffect, useRef, useState } from 'react';

/** CSS transitions handle reversals from the current interpolated position.
 * The exit deadline is cancellable and never calls completion from cleanup. */
export function usePresence(open: boolean, duration: number, onExitComplete?: () => void) {
  const [present, setPresent] = useState(open);
  const [entered, setEntered] = useState(false);
  const callback = useRef(onExitComplete);
  useEffect(() => { callback.current = onExitComplete; }, [onExitComplete]);
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setPresent(true);
      if (duration === 0) setEntered(true);
      else firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => setEntered(true));
      });
    } else {
      setEntered(false);
      if (present) timer = setTimeout(() => {
        setPresent(false);
        callback.current?.();
      }, duration === 0 ? 0 : duration + 32);
    }
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(timer);
    };
  }, [open, duration, present]);
  return { present: open || present, entered: open && entered };
}
