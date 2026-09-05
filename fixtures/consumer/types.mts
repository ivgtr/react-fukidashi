import { createElement } from 'react';
import {
  Bubble,
  Fukidashi,
  Typewriter,
  useTypewriter,
  useReducedMotion,
  type FukidashiStyle,
  type TypewriterControls,
} from 'react-fukidashi';

const style: FukidashiStyle = { '--fukidashi-width': '280px' };
createElement(Bubble, { style, tail: { side: 'left' } }, 'Hello');
createElement(Fukidashi, { anchor: 'Anchor', placement: 'top-end' }, 'Hello');
createElement(Typewriter, { text: ['Hello', '日本語 👩🏽‍💻'], speed: 35 });
const controls: TypewriterControls = { pause() {}, resume() {}, skip() {}, reset() {} };
void [controls, useTypewriter, useReducedMotion];
// @ts-expect-error The public declarations must reject invalid message types.
createElement(Typewriter, { text: 123 });
