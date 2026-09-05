# react-fukidashi

**ことばに、表情を。** カスタマイズできるReactの吹き出しと、制御できる文字送り。

v2は全面的な再設計です。見た目・配置・文字送りを分離し、必要な機能だけ組み合わせます。v1互換のラッパーはありません。[移行ガイド](MIGRATION.md)を参照してください。

> このブランチは `2.0.0-beta.0` の開発版です。PRをマージしただけではnpmに公開されません。公開済みバージョンと、このREADMEのAPIを混同しないでください。

## 構成

| API                | 用途                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| `Bubble`           | 通常のレイアウトで使う吹き出し。チャット、会話ログ、カードなど             |
| `Fukidashi`        | アンカーに追従する吹き出し。12方向、衝突回避、Portal、入退場アニメーション |
| `Typewriter`       | 独立した文字送り。日本語・結合文字・絵文字、停止・再開・スキップ・リセット |
| `useTypewriter`    | 描画を完全に自作したい場合のヘッドレスな文字送りフック                     |
| `useReducedMotion` | OSの動きを減らす設定を参照するフック                                       |

React / React DOM 18.3.1または19を使用します。CSSは明示的に読み込み、アニメーションエンジンやCSS-in-JSランタイムは不要です。位置計算には `@floating-ui/react-dom` を使用します。

## 開発版を試す

```sh
git clone https://github.com/ivgtr/react-fukidashi.git
cd react-fukidashi
git switch refactor/fukidashi-v2
npm ci
npm run dev
```

Node.js 22.12以上（推奨24）を使用してください。プレイグラウンドは `http://127.0.0.1:4173` で開きます。テーマ、幅、角丸、しっぽ、配置、入退場、文字送りを変更できます。

## 最小の使用例

```tsx
import { useState } from 'react';
import { Fukidashi, Typewriter } from 'react-fukidashi';
import 'react-fukidashi/style.css';

export function Greeting() {
  const [open, setOpen] = useState(true);
  return (
    <Fukidashi
      open={open}
      placement="top-start"
      anchor={(props) => (
        <button {...props} aria-expanded={open} onClick={() => setOpen(!open)}>
          話す
        </button>
      )}
    >
      <Typewriter text="こんにちは。\n日本語も、絵文字も 👩🏽‍💻" cursor="▍" />
    </Fukidashi>
  );
}
```

`Fukidashi` は開閉のきっかけを決めません。クリック・hover・focus・会話の進行などはアプリで `open` を制御してください。単に常時表示するなら `open` は省略できます。

## 自由な見た目と内容

```tsx
import { Bubble } from 'react-fukidashi';

<Bubble
  variant="comic"
  tail={{ side: 'left', offset: '30%', size: 16 }}
  className="chat-message"
  style={{
    '--fukidashi-background': '#fff1bf',
    '--fukidashi-color': '#382818',
    '--fukidashi-border-color': '#382818',
    '--fukidashi-border-width': '2px',
    '--fukidashi-radius': '12px',
    '--fukidashi-padding': '20px',
    '--fukidashi-width': '320px',
    '--fukidashi-shadow': '4px 4px 0 #382818',
  }}
>
  <h3>次のステップへ</h3>
  <p>文字以外も、そのまま入れられます。</p>
  <button>続ける</button>
</Bubble>;
```

上のCSS変数は `Bubble` / `Fukidashi` の `style` で指定できます。`--fukidashi-max-width`（既定24rem）も変更できます。CSS変数以外の通常の `style`、`className`、`contentClassName`、`contentStyle`、HTML属性とDOM refも渡せます。内部用の `--fukidashi-tail-*`・`--fukidashi-available-*` は直接変更せず、対応するpropsを使ってください。

文字色やフォント、余白は呼び出し側で自由に調整できます。ルートへの `transform` は入退場・位置計算用の要素と分かれているため、これらのアニメーションと競合しません。

## 文字送りを操作する

```tsx
import { useRef } from 'react';
import { Typewriter, type TypewriterControls } from 'react-fukidashi';

export function Dialogue() {
  const typing = useRef<TypewriterControls>(null);
  return (
    <>
      <Typewriter
        ref={typing}
        text={['最初の行。', '次の行 👨‍👩‍👧‍👦']}
        speed={35}
        startDelay={200}
        lineDelay={300}
        punctuationDelay={140}
        onComplete={() => console.log('全文の表示が完了')}
      />
      <button onClick={() => typing.current?.pause()}>停止</button>
      <button onClick={() => typing.current?.resume()}>再開</button>
      <button onClick={() => typing.current?.skip()}>全文表示</button>
      <button onClick={() => typing.current?.reset()}>最初から</button>
    </>
  );
}
```

タイマーは常に一つです。停止中は残り時間を保持します。速度の変更は表示済みの文字を消さず、次の文字の残り時間に反映されます。`text` の内容が変わると新しい再生に切り替わり、古いタイマーは破棄されます。同じ内容の配列や新しいコールバックを渡しても再生し直しません。

`onComplete` は全文表示またはskip時に一度だけ呼びます。アンマウントでは呼びません。`reset()` すると新しい完了通知の対象になります。空文字も完了と扱います。`paused={true}` はアプリ側の制御が優先されるため、refの `resume()` では解除されません。

```tsx
import { useTypewriter } from 'react-fukidashi';

function CustomText() {
  const typing = useTypewriter({ text: '好きな描画で。', speed: 50 });
  return (
    <div>
      <p aria-label={typing.text}>
        <span aria-hidden="true">{typing.visibleText}</span>
      </p>
      <progress value={typing.progress} max={1} />
      <button onClick={typing.skip} disabled={typing.isComplete}>
        スキップ
      </button>
    </div>
  );
}
```

フックは `text`, `visibleText`, `progress`（0〜1）, `status`（typing / paused / complete）, `isComplete` と4つの操作を返します。

## Props

### Bubble

| Prop                               | 既定     | 説明                                                    |
| ---------------------------------- | -------- | ------------------------------------------------------- |
| `variant`                          | `soft`   | `soft` / `dark` / `comic`                               |
| `tail`                             | `true`   | `false`で非表示。または `{ side, size, offset }`        |
| `tail.side`                        | `bottom` | 吹き出し本体のどの辺からしっぽを出すか                  |
| `tail.size`                        | `12`     | しっぽの正方形の一辺、px。0で非表示                     |
| `tail.offset`                      | `50%`    | 辺に沿ったしっぽの中心位置。numberはpx、stringはCSS長さ |
| `contentClassName`, `contentStyle` | —        | 本文のスクロール領域を調整                              |

通常のdivのHTML属性、`children`, `className`, `style`, `ref` を受け付けます。

### Fukidashi

Bubbleのprops（`tailRef`を除く）に加えて以下を使用できます。`children` は吹き出しの**中身**です。

| Prop                             | 既定     | 説明                                                                             |
| -------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `anchor`                         | 必須     | ReactNodeまたは `(props) => ReactNode`。render関数は `aria-describedby` を渡せる |
| `open`                           | `true`   | 表示状態。閉じるアニメーション後に本文をアンマウント                             |
| `placement`                      | `top`    | top / right / bottom / left と各 `-start`, `-end`                                |
| `gap`                            | `10`     | アンカーとしっぽ先端の間隔、px                                                   |
| `tail`                           | `true`   | falseまたは `{ size }`。辺・位置は自動計算                                       |
| `portal`                         | `true`   | document.bodyに配置。falseでインライン、HTMLElementで任意の配置先                |
| `strategy`                       | `fixed`  | `fixed` / `absolute`                                                             |
| `avoidCollisions`                | `true`   | flip / shift / 利用可能領域に合わせたサイズ制限                                  |
| `collisionPadding`               | `12`     | 衝突判定の余白、px                                                               |
| `trackAnchor`                    | `false`  | transformで動くアンカーに毎フレーム追従。必要な場合だけ有効化                    |
| `motion`                         | `pop`    | pop / fade / slide / none                                                        |
| `duration`                       | `180`    | 入退場の時間、ms                                                                 |
| `reducedMotion`                  | `system` | system / always / never                                                          |
| `zIndex`                         | `1000`   | 配置用要素の重なり順                                                             |
| `anchorClassName`, `anchorStyle` | —        | アンカーを囲むinline-flexのspan                                                  |
| `onExitComplete`                 | —        | 閉じ終わったときだけ実行。途中で再表示したら取り消し                             |
| `role`                           | `note`   | 文脈に応じて変更。インタラクティブな本文にtooltipを指定しない                    |

画面や祖先スクロール、要素のリサイズ、レイアウト変更を追跡します。利用できる高さを超える本文はスクロールします。`portal={false}` や独自のPortal先では、その配置先のoverflow・transform・積層コンテキストが影響します。アンカーはinline-flexのspanで囲まれるため、tableや特殊なレイアウトには適切なラッパーを用意してください。

### Typewriter / useTypewriter

| Prop               | 既定     | 説明                                                           |
| ------------------ | -------- | -------------------------------------------------------------- |
| `text`             | 必須     | string / readonly string[]。配列の要素間は改行                 |
| `speed`            | `35`     | 書記素ごとの待ち時間、ms。0で即時表示                          |
| `startDelay`       | `0`      | 最初の文字の前に追加する時間                                   |
| `lineDelay`        | `250`    | 改行の後に追加する時間                                         |
| `punctuationDelay` | `140`    | 句読点の後に追加する時間                                       |
| `paused`           | `false`  | アプリ側で一時停止                                             |
| `disabled`         | `false`  | 文字送りを無効にして全文を表示                                 |
| `reducedMotion`    | `system` | system / always / never                                        |
| `onComplete`       | —        | その再生の全文表示完了通知                                     |
| `cursor`           | なし     | Typewriterのみ。例：`"▍"`                                      |
| `reserveSpace`     | `true`   | Typewriterのみ。全文相当の領域を確保してレイアウトの跳ねを防ぐ |

`Typewriter` はspanのHTML属性も受け付けます。refはDOMではなく `TypewriterControls` です。最初の文字は `startDelay + speed` 後に表示します。負の時間は0、NaN・Infinityは既定値として扱います。

## アクセシビリティとSSR

`Typewriter` は全文をスクリーンリーダーに一度だけ公開し、文字ごとの視覚表示は `aria-hidden` にします。大量のlive-region通知は行いません。段落ごとの読み上げ等が必要なら呼び出し側で適切なlive regionを設けてください。`reserveSpace` は視覚上の領域確保のみで、不可視文字をフォーカス対象にはしません。

OSが動きを減らす設定なら入退場を即時化し、文字送りも全文表示にします。`reducedMotion="always"` で明示的に無効化できます。`never` は意図的な上書きなので慎重に使用してください。

`Fukidashi` は汎用の吹き出しであり、メニューやモーダルダイアログの代替ではありません。focus trap、Escape、外側クリック、フォーカス復帰は提供しません。閉じている途中の本文は `aria-hidden` / `inert` で操作対象から外します。アンカーのrender関数から渡す `aria-describedby` は簡潔な補足説明に向いています。複雑な操作UIでは用途に適したroleとフォーカス設計をアプリで行ってください。

モジュールの読み込み時にwindow/documentへアクセスしません。ESM/CJS双方でSSRできます。`Bubble` と `Typewriter` はサーバーで描画し、Portalの吹き出しはマウント後に配置します。React Server Components向けに `use client` 境界を配布物にも保持します。ブラウザーは `Intl.Segmenter`, ResizeObserver, inert などを持つ現行環境を推奨します。Segmenterがない環境では絵文字を壊さないよう全文を一つの単位として表示し、文字送りの粒度だけを落とします。

## 検証・配布

```sh
npm run check                 # 型・単体テスト・ESM/CJS・npm梱包・デモ・整形
npx playwright install chromium
npm run test:e2e              # 実ブラウザーで12配置、衝突、入退場、モバイル等
npm run build                # dist/へESM、CJS、型宣言、CSS
npm run build:docs           # docs/へプレイグラウンド
```

CIではReact 18 / 19とNode 22 / 24を検証し、Chromiumの回帰テスト・スクリーンショットを保存します。Firefox / Safariおよび実機スクリーンリーダーの手動評価はリリース前の確認対象です。

リリースは別操作です。GitHub Releaseのタグとpackage.jsonのversionが一致した場合のみnpm公開します。プレリリースは `beta`、安定版は `latest` に送ります。PR作成・マージではnpm公開されません。

## 設計の参考

[ReactのEffectとcleanup](https://react.dev/reference/react/useEffect)、[Floating UIのautoUpdate](https://floating-ui.com/docs/autoupdate)、[prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)に沿って、表示処理と後始末、配置とアニメーションを分離しています。

## License

MIT © [ivgtr](https://github.com/ivgtr)。[LICENSE](LICENSE)を参照してください。
