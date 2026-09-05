import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import type { Placement, Strategy } from '@floating-ui/react-dom';

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type BubbleVariant = 'soft' | 'dark' | 'comic';
export type MotionPreset = 'pop' | 'fade' | 'slide' | 'none';
export type ReducedMotion = 'system' | 'always' | 'never';
export type FukidashiStyle = CSSProperties & {
  [name: `--fukidashi-${string}`]: string | number | undefined;
};

export interface TailOptions {
  /** Side of the bubble from which the tail emerges. */
  side?: Side;
  /** Side length of the tail square, in pixels. */
  size?: number;
  /** Center of the tail along its edge; numbers are pixels. */
  offset?: number | string;
}

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BubbleVariant;
  tail?: boolean | TailOptions;
  style?: FukidashiStyle;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  /** Exposed for positioning integrations; not normally needed. */
  tailRef?: Ref<HTMLSpanElement>;
}

export interface AnchorProps {
  'aria-describedby'?: string;
}

export interface FukidashiProps extends Omit<BubbleProps, 'tail' | 'tailRef'> {
  /** Use the render function to associate a focusable anchor with its bubble. */
  anchor: ReactNode | ((props: AnchorProps) => ReactNode);
  open?: boolean;
  placement?: Placement;
  gap?: number;
  tail?: boolean | Pick<TailOptions, 'size'>;
  portal?: boolean | HTMLElement;
  strategy?: Strategy;
  collisionPadding?: number;
  avoidCollisions?: boolean;
  /** Enable frame-by-frame tracking for transform-animated anchors. */
  trackAnchor?: boolean;
  motion?: MotionPreset;
  duration?: number;
  reducedMotion?: ReducedMotion;
  zIndex?: number;
  anchorClassName?: string;
  anchorStyle?: CSSProperties;
  onExitComplete?: () => void;
}

export type TypewriterStatus = 'typing' | 'paused' | 'complete';

export interface TypewriterOptions {
  text: string | readonly string[];
  /** Milliseconds per grapheme; zero reveals everything immediately. */
  speed?: number;
  startDelay?: number;
  lineDelay?: number;
  punctuationDelay?: number;
  paused?: boolean;
  disabled?: boolean;
  reducedMotion?: ReducedMotion;
  /** Called once per completed run, including skip; never on cleanup. */
  onComplete?: () => void;
}

export interface TypewriterControls {
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
}

export interface TypewriterResult extends TypewriterControls {
  text: string;
  visibleText: string;
  progress: number;
  status: TypewriterStatus;
  isComplete: boolean;
}

export interface TypewriterProps extends TypewriterOptions,
  Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  cursor?: ReactNode;
  reserveSpace?: boolean;
}

export type { Placement, Strategy };
