import { useRef, useState } from 'react';
import { Bubble, Fukidashi, Typewriter, type TypewriterControls } from 'react-fukidashi';
import 'react-fukidashi/style.css';

export function App() {
  const typing = useRef<TypewriterControls>(null);
  const [open, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [paused, setPaused] = useState(true);
  return (
    <main style={{ padding: 40 }}>
      <Bubble
        variant="comic"
        tail={{ side: 'left' }}
        style={{ '--fukidashi-background': 'rgb(255, 241, 191)' }}
      >
        <p>
          <Typewriter
            ref={typing}
            text="こんにちは。今日は何をしよう？"
            speed={40}
            lineDelay={0}
            punctuationDelay={0}
            paused={paused}
            cursor="▍"
            data-testid="typing"
            onComplete={() => setComplete(true)}
          />
        </p>
        <button type="button" onClick={() => typing.current?.skip()}>
          全文表示
        </button>
        <button onClick={() => setPaused(false)}>Start</button>
        <button onClick={() => typing.current?.pause()}>Pause</button>
        <button onClick={() => typing.current?.resume()}>Resume</button>
        <button
          onClick={() => {
            setComplete(false);
            typing.current?.reset();
          }}
        >
          Reset
        </button>
        <output aria-label="Playback">{complete ? 'complete' : 'typing'}</output>
      </Bubble>
      <Fukidashi
        open={open}
        placement="bottom-start"
        anchor={(props) => (
          <button {...props} type="button" onClick={() => setOpen((value) => !value)}>
            開閉
          </button>
        )}
      >
        <Typewriter text="インストールしたパッケージです。" speed={0} />
      </Fukidashi>
    </main>
  );
}
