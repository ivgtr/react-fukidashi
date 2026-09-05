import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Typewriter, type TypewriterControls } from '../src/index.js';

function copy(root: Element) {
  const selection = document.getSelection()!;
  selection.removeAllRanges();
  selection.selectAllChildren(root);
  const data = new Map<string, string>();
  const event = new Event('copy', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      clearData: () => data.clear(),
      setData: (type: string, text: string) => data.set(type, text),
    },
  });
  root.dispatchEvent(event);
  return { text: data.get('text/plain'), handled: event.defaultPrevented };
}

it('copies revealed graphemes, explicit newlines and no cursor or assistive duplicate', () => {
  vi.useFakeTimers();
  try {
    const ref = createRef<TypewriterControls>();
    const { container } = render(
      <Typewriter
        ref={ref}
        text={'か\u3099\n👩🏽‍💻secret'}
        cursor="cursor"
        speed={100}
        lineDelay={0}
      />,
    );
    expect(copy(container).text).toBe('');
    for (let count = 0; count < 3; count++) act(() => vi.advanceTimersByTime(100));
    expect(copy(container).text).toBe('か\u3099\n👩🏽‍💻');
    act(() => ref.current?.skip());
    expect(copy(container).text).toBe('か\u3099\n👩🏽‍💻secret');
    act(() => ref.current?.reset());
    expect(copy(container).text).toBe('');
  } finally {
    vi.useRealTimers();
  }
});

it('honors application copy handlers and removes the document listener on the last unmount', () => {
  const first = render(
    <Typewriter text="First" paused onCopy={(event) => event.preventDefault()} />,
  );
  const second = render(<Typewriter text="Second" paused />);
  expect(copy(first.container.firstElementChild!)).toEqual({ text: undefined, handled: true });
  first.unmount();
  expect(copy(second.container).text).toBe('');
  const detachedPresentation = second.container.cloneNode(true) as Element;
  second.unmount();
  document.body.append(detachedPresentation);
  expect(copy(detachedPresentation).handled).toBe(false);
  detachedPresentation.remove();
});
