import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Typewriter, type TypewriterControls } from '../src/index.js';
import '../src/style.css';

const params = new URLSearchParams(location.search);
const text = params.get('text') ?? 'The quick brown fox jumps over the lazy dog.';
const width = Number(params.get('width') ?? 180);

function Fixture() {
  const typing = useRef<TypewriterControls>(null);
  const [paused, setPaused] = useState(true);
  const [completions, setCompletions] = useState(0);
  return (
    <main lang={params.get('lang') ?? 'en'} dir={params.get('dir') ?? 'ltr'}>
      <button onClick={() => setPaused(false)}>Start</button>
      <button onClick={() => typing.current?.pause()}>Pause</button>
      <button onClick={() => typing.current?.resume()}>Resume</button>
      <button onClick={() => typing.current?.skip()}>Skip</button>
      <button onClick={() => typing.current?.reset()}>Reset</button>
      <output aria-label="Completions">{completions}</output>
      <div style={{ width, maxWidth: '100%', font: '20px/1.4 Arial, sans-serif' }}>
        <Typewriter
          ref={typing}
          data-testid="typing"
          text={text}
          speed={25}
          lineDelay={0}
          punctuationDelay={0}
          paused={paused}
          cursor={params.get('cursor') === 'false' ? null : '▍'}
          reserveSpace={params.get('reserve') !== 'false'}
          onComplete={() => setCompletions((count) => count + 1)}
        />
      </div>
      <div style={{ width, maxWidth: '100%', font: '20px/1.4 Arial, sans-serif' }}>
        <span className="fukidashi-typewriter" data-testid="reference" aria-hidden="true">
          <span className="fukidashi-typewriter-visible">{text}</span>
        </span>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
