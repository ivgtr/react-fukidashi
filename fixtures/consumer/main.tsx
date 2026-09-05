import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bubble, Fukidashi, Typewriter, type TypewriterControls } from 'react-fukidashi';
import 'react-fukidashi/style.css';

function App() {
  const typing = useRef<TypewriterControls>(null);
  const [open, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  return (
    <main style={{ padding: 40 }}>
      <Bubble variant="comic" tail={{ side: 'left' }} style={{ '--fukidashi-background': 'rgb(255, 241, 191)' }}>
        <p><Typewriter ref={typing} text="こんにちは。今日は何をしよう？" speed={40} onComplete={() => setComplete(true)} /></p>
        <button type="button" onClick={() => typing.current?.skip()}>全文表示</button>
        <output aria-label="Playback">{complete ? 'complete' : 'typing'}</output>
      </Bubble>
      <Fukidashi open={open} placement="bottom-start" anchor={(props) => (
        <button {...props} type="button" onClick={() => setOpen((value) => !value)}>開閉</button>
      )}>
        <Typewriter text="インストールしたパッケージです。" speed={0} />
      </Fukidashi>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
