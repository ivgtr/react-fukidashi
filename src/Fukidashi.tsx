'use client';

import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { arrow, autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import { Bubble } from './Bubble.js';
import { usePresence } from './hooks/usePresence.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { nonNegative } from './text.js';
import type { FukidashiProps, FukidashiStyle, Side } from './types.js';

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export const Fukidashi = forwardRef<HTMLDivElement, FukidashiProps>(function Fukidashi(
  {
    anchor,
    children,
    open = true,
    placement = 'top',
    gap = 10,
    tail = true,
    portal = true,
    strategy = 'fixed',
    collisionPadding = 12,
    avoidCollisions = true,
    trackAnchor = false,
    motion = 'pop',
    duration = 180,
    reducedMotion = 'system',
    zIndex = 1000,
    anchorClassName,
    anchorStyle,
    onExitComplete,
    id: suppliedId,
    role = 'note',
    ...bubbleProps
  },
  ref,
) {
  const generatedId = useId();
  const id = suppliedId ?? `fukidashi-${generatedId}`;
  const reduced = useReducedMotion(reducedMotion);
  const effectiveDuration = reduced || motion === 'none' ? 0 : nonNegative(duration, 180);
  const { present, entered } = usePresence(open, effectiveDuration, onExitComplete);
  const tailRef = useRef<HTMLSpanElement>(null);
  const tailSize =
    tail === false ? 0 : nonNegative(typeof tail === 'object' ? (tail.size ?? 12) : 12, 12);
  const padding = nonNegative(collisionPadding, 12);
  const middleware = useMemo(
    () => [
      offset((Number.isFinite(gap) ? gap : 10) + tailSize / Math.SQRT2),
      ...(avoidCollisions
        ? [
            flip({ padding }),
            shift({ padding }),
            size({
              padding,
              apply({ availableWidth, availableHeight, elements }) {
                elements.floating.style.setProperty(
                  '--fukidashi-available-width',
                  `${Math.max(0, availableWidth)}px`,
                );
                elements.floating.style.setProperty(
                  '--fukidashi-available-height',
                  `${Math.max(0, availableHeight)}px`,
                );
              },
            }),
          ]
        : []),
      ...(tailSize > 0 ? [arrow({ element: tailRef, padding: Math.max(16, tailSize) })] : []),
    ],
    [gap, tailSize, avoidCollisions, padding],
  );
  const whileMounted = useCallback(
    (reference: Parameters<typeof autoUpdate>[0], floating: HTMLElement, update: () => void) =>
      autoUpdate(reference, floating, update, { animationFrame: trackAnchor }),
    [trackAnchor],
  );
  const {
    refs,
    floatingStyles,
    placement: resolvedPlacement,
    middlewareData,
    isPositioned,
  } = useFloating({
    open: present,
    placement,
    strategy,
    middleware,
    whileElementsMounted: whileMounted,
  });
  const [body, setBody] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setBody(document.body);
  }, []);
  useEffect(() => {
    const element = refs.floating.current;
    if (!element) return;
    element.toggleAttribute('inert', !open);
    if (!avoidCollisions) {
      element.style.removeProperty('--fukidashi-available-width');
      element.style.removeProperty('--fukidashi-available-height');
    }
  }, [open, present, avoidCollisions, refs.floating, body]);

  const side = resolvedPlacement.split('-')[0] as Side;
  const arrowOffset =
    side === 'top' || side === 'bottom' ? middlewareData.arrow?.x : middlewareData.arrow?.y;
  const center = arrowOffset === undefined ? '50%' : `${arrowOffset + tailSize / 2}px`;
  const motionStyle: FukidashiStyle = {
    '--fukidashi-duration': `${effectiveDuration}ms`,
    '--fukidashi-origin':
      side === 'top'
        ? `${center} bottom`
        : side === 'bottom'
          ? `${center} top`
          : side === 'left'
            ? `right ${center}`
            : `left ${center}`,
    '--fukidashi-enter-x': side === 'left' ? '6px' : side === 'right' ? '-6px' : '0px',
    '--fukidashi-enter-y': side === 'top' ? '6px' : side === 'bottom' ? '-6px' : '0px',
  };
  const floating = present ? (
    <div
      ref={refs.setFloating}
      className="fukidashi-positioner"
      data-placement={resolvedPlacement}
      aria-hidden={!open || undefined}
      style={{ ...floatingStyles, zIndex, visibility: isPositioned ? 'visible' : 'hidden' }}
    >
      <div
        className="fukidashi-motion"
        data-motion={motion}
        data-state={entered ? 'open' : 'closed'}
        data-reduced-motion={reducedMotion}
        style={motionStyle}
      >
        <Bubble
          {...bubbleProps}
          ref={ref}
          id={id}
          role={role}
          tailRef={tailRef}
          tail={tail === false ? false : { size: tailSize, side: opposite[side], offset: center }}
        >
          {children}
        </Bubble>
      </div>
    </div>
  ) : null;
  const target = portal === true ? body : portal || null;
  return (
    <>
      <span
        ref={refs.setReference}
        className={['fukidashi-anchor', anchorClassName].filter(Boolean).join(' ')}
        style={anchorStyle}
      >
        {typeof anchor === 'function'
          ? anchor({ 'aria-describedby': open ? id : undefined })
          : anchor}
      </span>
      {portal === false ? floating : target ? createPortal(floating, target) : null}
    </>
  );
});
