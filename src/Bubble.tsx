'use client';

import { forwardRef } from 'react';
import type { BubbleProps, FukidashiStyle } from './types.js';
import { nonNegative } from './text.js';

/** A standalone, semantic-free surface. Use it in normal document flow for
 * chat messages, or use Fukidashi to anchor it to another element. */
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  {
    children,
    variant = 'soft',
    tail = true,
    className,
    style,
    contentClassName,
    contentStyle,
    tailRef,
    ...attributes
  },
  ref,
) {
  const options = typeof tail === 'object' ? tail : {};
  const size = nonNegative(options.size ?? 12, 12);
  const offset = options.offset ?? '50%';
  const variables: FukidashiStyle = {
    ...style,
    '--fukidashi-tail-size': `${size}px`,
    '--fukidashi-tail-offset': typeof offset === 'number' ? `${offset}px` : offset,
  };
  return (
    <div
      {...attributes}
      ref={ref}
      className={['fukidashi-bubble', className].filter(Boolean).join(' ')}
      data-variant={variant}
      style={variables}
    >
      {tail !== false && size > 0 && (
        <span
          ref={tailRef}
          className="fukidashi-tail"
          data-side={options.side ?? 'bottom'}
          aria-hidden="true"
        />
      )}
      <div
        className={['fukidashi-content', contentClassName].filter(Boolean).join(' ')}
        style={contentStyle}
      >
        {children}
      </div>
    </div>
  );
});
