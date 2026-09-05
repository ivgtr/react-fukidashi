import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bubble, Fukidashi, Typewriter } from '../src/index.js';
import type { BubbleVariant, MotionPreset, Placement, TypewriterControls } from '../src/index.js';
import '../src/style.css';
import './style.css';

const placements: Placement[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
];
const message = 'こんにちは。\nことばに、ちょっと表情を。\n日本語も、絵文字も 👩🏽‍💻 自然なテンポで。';

function App() {
  const [text, setText] = useState(message);
  const [placement, setPlacement] = useState<Placement>('top');
  const [variant, setVariant] = useState<BubbleVariant>('soft');
  const [motion, setMotion] = useState<MotionPreset>('pop');
  const [width, setWidth] = useState(300);
  const [radius, setRadius] = useState(18);
  const [tailSize, setTailSize] = useState(12);
  const [speed, setSpeed] = useState(35);
  const [open, setOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const typing = useRef<TypewriterControls>(null);
  const replay = () => {
    setOpen(true);
    setPaused(false);
    setComplete(false);
    typing.current?.reset();
  };
  const code = `<Fukidashi\n  anchor={(props) => <button {...props}>話す</button>}\n  open={open}\n  placement="${placement}"\n  variant="${variant}"\n  motion="${motion}"\n  tail={{ size: ${tailSize} }}\n  style={{ '--fukidashi-width': '${width}px',\n           '--fukidashi-radius': '${radius}px' }}\n>\n  <Typewriter text=${JSON.stringify(text)}\n    speed={${speed}} cursor="▍" />\n</Fukidashi>`;
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            f.
          </span>{' '}
          react-fukidashi <span className="version">v2 beta</span>
        </a>
        <a className="repo-link" href="https://github.com/ivgtr/react-fukidashi">
          GitHub ↗
        </a>
      </header>
      <main id="top">
        <section className="intro">
          <p className="eyebrow">SMALL COMPONENT. MORE EXPRESSION.</p>
          <h1>
            ことばに、<em>表情を。</em>
          </h1>
          <p className="intro-copy">
            ただ表示するだけじゃない。かたちも、間も、話し方も。
            <br />
            あなたのUIに馴染む、Reactの吹き出し。
          </p>
          <div className="feature-tags">
            <span>Composable</span>
            <span>Controllable</span>
            <span>React 18 / 19</span>
          </div>
        </section>
        <section className="playground" aria-labelledby="playground-title">
          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <h2 id="playground-title">つくって、試す。</h2>
            </div>
            <p>設定はすべて、その場で反映されます。</p>
          </div>
          <div className="playground-grid">
            <aside className="inspector" aria-label="吹き出しの設定">
              <div className="control-heading">
                <h3>かたち</h3>
                <span>APPEARANCE</span>
              </div>
              <label className="field">
                テーマ
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value as BubbleVariant)}
                >
                  <option value="soft">Soft / やわらかい</option>
                  <option value="dark">Dark / 夜の会話</option>
                  <option value="comic">Comic / マンガ風</option>
                </select>
              </label>
              <label className="field">
                配置
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as Placement)}
                >
                  {placements.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field range-field">
                <span>
                  幅 <output>{width}px</output>
                </span>
                <input
                  aria-label="吹き出しの幅"
                  type="range"
                  min="180"
                  max="440"
                  step="10"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </label>
              <label className="field range-field">
                <span>
                  角丸 <output>{radius}px</output>
                </span>
                <input
                  aria-label="角丸"
                  type="range"
                  min="0"
                  max="36"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </label>
              <label className="field range-field">
                <span>
                  しっぽ <output>{tailSize === 0 ? 'なし' : `${tailSize}px`}</output>
                </span>
                <input
                  aria-label="しっぽのサイズ"
                  type="range"
                  min="0"
                  max="28"
                  step="2"
                  value={tailSize}
                  onChange={(e) => setTailSize(Number(e.target.value))}
                />
              </label>
              <div className="control-heading">
                <h3>うごき</h3>
                <span>MOTION</span>
              </div>
              <label className="field">
                登場アニメーション
                <select value={motion} onChange={(e) => setMotion(e.target.value as MotionPreset)}>
                  <option value="pop">Pop / ふわっと</option>
                  <option value="fade">Fade / すっと</option>
                  <option value="slide">Slide / そっと</option>
                  <option value="none">None / 動かさない</option>
                </select>
              </label>
              <label className="field range-field">
                <span>
                  文字送り <output>{speed === 0 ? '即時' : `${speed}ms / 文字`}</output>
                </span>
                <input
                  aria-label="文字送り速度"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
              </label>
            </aside>
            <div className="preview-column">
              <div className="preview" data-testid="preview">
                <div className="preview-meta">
                  <span>
                    <i /> LIVE PREVIEW
                  </span>
                  <span>端では自動で配置を調整</span>
                </div>
                <div className="speaker-area">
                  <Fukidashi
                    anchor={(props) => (
                      <button
                        {...props}
                        className="speaker"
                        aria-label="吹き出しの表示切り替え"
                        aria-expanded={open}
                        onClick={() => {
                          if (!open) setComplete(false);
                          setOpen(!open);
                        }}
                      >
                        <span className="speaker-face" aria-hidden="true">
                          <i />
                          <i />
                          <b />
                        </span>
                      </button>
                    )}
                    open={open}
                    placement={placement}
                    variant={variant}
                    motion={motion}
                    tail={tailSize === 0 ? false : { size: tailSize }}
                    style={{
                      '--fukidashi-width': `${width}px`,
                      '--fukidashi-radius': `${radius}px`,
                    }}
                  >
                    <Typewriter
                      ref={typing}
                      text={text}
                      speed={speed}
                      paused={paused}
                      cursor="▍"
                      onComplete={() => setComplete(true)}
                    />
                  </Fukidashi>
                  <p className="speaker-caption">クリックして、話しかけてみて。</p>
                </div>
                <div className="preview-footer">
                  <span className="play-status" role="status">
                    {!open
                      ? '非表示'
                      : complete
                        ? 'お話し完了'
                        : paused
                          ? 'ひとやすみ中'
                          : 'お話し中…'}
                  </span>
                  <div className="transport">
                    <button onClick={() => setPaused(!paused)} disabled={!open || complete}>
                      {paused ? '再開' : '一時停止'}
                    </button>
                    <button onClick={() => typing.current?.skip()} disabled={!open || complete}>
                      全文表示
                    </button>
                    <button className="replay" onClick={replay}>
                      ↻ 再生し直す
                    </button>
                  </div>
                </div>
              </div>
              <label className="message-editor">
                <span>
                  ことば <small>MESSAGE</small>
                </span>
                <textarea
                  value={text}
                  rows={3}
                  onChange={(e) => {
                    setText(e.target.value);
                    setComplete(false);
                  }}
                  spellCheck={false}
                />
              </label>
            </div>
          </div>
          <details className="code-panel">
            <summary>
              この設定のコードを見る <span>TSX</span>
            </summary>
            <pre>
              <code>{code}</code>
            </pre>
            <p>
              import {'{ Fukidashi, Typewriter }'} from 'react-fukidashi';
              <br />
              import 'react-fukidashi/style.css';
            </p>
          </details>
        </section>
        <section className="examples" aria-labelledby="examples-title">
          <div className="section-heading">
            <div>
              <span className="section-number">02</span>
              <h2 id="examples-title">使い方は、ひとつじゃない。</h2>
            </div>
          </div>
          <div className="example-grid">
            <article className="example-card">
              <span className="example-label">IN THE FLOW</span>
              <h3>チャットの、いつもの場所に。</h3>
              <div className="chat-stack">
                <Bubble
                  tail={{ side: 'left', offset: 24 }}
                  style={{ '--fukidashi-max-width': '100%' }}
                >
                  吹き出しだけでも、使える？
                </Bubble>
                <Bubble
                  variant="dark"
                  tail={{ side: 'right', offset: 24 }}
                  style={{ '--fukidashi-max-width': '100%' }}
                >
                  もちろん。配置も文字送りも、
                  <br />
                  必要なぶんだけ組み合わせて。
                </Bubble>
              </div>
              <p className="example-caption">Bubbleは通常のレイアウトに配置できます。</p>
            </article>
            <article className="example-card">
              <span className="example-label">ANY REACT CONTENT</span>
              <h3>テキストの、もう一歩先へ。</h3>
              <Bubble
                variant="comic"
                tail={{ side: 'bottom', offset: '75%' }}
                style={{ '--fukidashi-width': '100%', '--fukidashi-max-width': '100%' }}
              >
                <span className="new-label">NEW IDEA</span>
                <h4>次は、何をつくろう？</h4>
                <p className="rich-copy">リンクもボタンも、好きなコンポーネントも。</p>
                <a className="sample-link" href="#playground-title">
                  プレイグラウンドで試す ↗
                </a>
              </Bubble>
              <p className="example-caption">childrenは任意のReactNode。用途を限定しません。</p>
            </article>
          </div>
        </section>
        <section className="principles">
          <div>
            <b>01 / 見た目を縛らない</b>
            <p>CSS変数・className・style。既存のデザインに合わせて。</p>
          </div>
          <div>
            <b>02 / 再生をあきらめない</b>
            <p>一時停止、スキップ、再生し直し。操作はあなたの手に。</p>
          </div>
          <div>
            <b>03 / 動かさない選択も</b>
            <p>OSの「動きを減らす」設定にも対応します。</p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>react-fukidashi / MIT / ivgtr</span>
        <span>小さな吹き出しに、大きな自由を。</span>
      </footer>
    </>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
