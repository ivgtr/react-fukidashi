import { createRef } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Bubble, Fukidashi, Typewriter } from '../src/index.js';
import type { TypewriterControls } from '../src/types.js';

describe('composable surfaces', () => {
  it('forwards Bubble attributes, DOM refs and arbitrary content', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Bubble ref={ref} className="custom" data-testid="bubble" variant="comic" tail={false}
      style={{ '--fukidashi-background': 'pink' }}><button>Action</button></Bubble>);
    expect(ref.current).toBe(screen.getByTestId('bubble'));
    expect(ref.current?.classList.contains('custom')).toBe(true);
    expect(ref.current?.style.getPropertyValue('--fukidashi-background')).toBe('pink');
    expect(ref.current?.querySelector('.fukidashi-tail')).toBeNull();
    expect(screen.getByRole('button').textContent).toBe('Action');
  });
  it.each(['top', 'right', 'bottom', 'left'] as const)('supports a standalone %s tail', side => {
    const { container } = render(<Bubble tail={{ side, offset: '30%', size: 18 }}>Hello</Bubble>);
    expect(container.querySelector('.fukidashi-tail')?.getAttribute('data-side')).toBe(side);
    expect(container.querySelector<HTMLElement>('.fukidashi-bubble')?.style.getPropertyValue('--fukidashi-tail-size')).toBe('18px');
  });
  it('exposes full accessible text once and imperative typewriter controls', () => {
    const ref = createRef<TypewriterControls>();
    const { container } = render(<Typewriter ref={ref} text="Hello 👋" cursor="▍" />);
    expect(container.querySelector('.fukidashi-sr-only')?.textContent).toBe('Hello 👋');
    expect(container.querySelector('.fukidashi-typewriter-space')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.fukidashi-typewriter-visible')?.getAttribute('aria-hidden')).toBe('true');
    act(() => ref.current?.skip());
    expect(container.querySelector('.fukidashi-typewriter-visible')?.textContent).toBe('Hello 👋');
    expect(container.querySelector('.fukidashi-cursor')).toBeNull();
  });
  it('portals into an explicit container and associates the anchor without cloning it', async () => {
    const target = document.createElement('div'); document.body.append(target);
    const clicked = vi.fn();
    const { unmount } = render(<Fukidashi portal={target} motion="none"
      anchor={props => <button {...props} onClick={clicked}>Anchor</button>}>Message</Fukidashi>);
    await waitFor(() => expect(target.querySelector('[role="note"]')).not.toBeNull());
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-describedby')).toBe(target.querySelector('[role="note"]')?.id);
    act(() => button.click()); expect(clicked).toHaveBeenCalledTimes(1);
    unmount(); expect(target.childElementCount).toBe(0); target.remove();
  });
  it('does not render a closed bubble', () => {
    render(<Fukidashi open={false} anchor={<button>Anchor</button>}>Closed message</Fukidashi>);
    expect(screen.queryByText('Closed message')).toBeNull();
  });
});
