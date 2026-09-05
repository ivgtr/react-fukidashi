// Development-only entry point: not an input of the documentation production build.
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Fukidashi, Typewriter } from '../src/index.js';
import type { Placement } from '../src/index.js';
import '../src/style.css';

function Fixture() {
  const [open, setOpen] = useState(true);
  const [placement, setPlacement] = useState<Placement>('top');
  const [edge, setEdge] = useState(false);
  const [long, setLong] = useState(false);
  const [exits, setExits] = useState(0);
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 5000 }}>
        <button onClick={() => setOpen((value) => !value)}>Toggle</button>
        <button onClick={() => setEdge((value) => !value)}>Move to edge</button>
        <button onClick={() => setLong((value) => !value)}>Resize content</button>
        <select
          aria-label="Placement"
          value={placement}
          onChange={(event) => setPlacement(event.target.value as Placement)}
        >
          {(['top', 'right', 'bottom', 'left'] as const)
            .flatMap((side) => [side, `${side}-start`, `${side}-end`])
            .map((value) => (
              <option key={value}>{value}</option>
            ))}
        </select>
        <output aria-label="Exits">{exits}</output>
      </div>
      <Fukidashi
        open={open}
        placement={placement}
        motion="slide"
        duration={160}
        onExitComplete={() => setExits((value) => value + 1)}
        anchorStyle={{ position: 'fixed', top: edge ? 2 : 330, left: edge ? 2 : 450 }}
        anchor={(props) => (
          <button {...props} data-testid="anchor" style={{ width: 100, height: 40 }}>
            Anchor
          </button>
        )}
        data-testid="bubble"
        style={{ '--fukidashi-width': '240px' }}
      >
        <Typewriter text={long ? 'Long content. '.repeat(100) : 'A stable bubble. 👩🏽‍💻'} speed={0} />
        <button>Inside action</button>
      </Fukidashi>
    </>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing fixture root');
createRoot(root).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
