# API

[README](README.md) / [Migration](MIGRATION.md)

## Bubble

通常のレイアウトに配置する吹き出しです。`children` に任意のReact要素を渡せます。

| Prop                               | Default  | Description                                             |
| ---------------------------------- | -------- | ------------------------------------------------------- |
| `variant`                          | `soft`   | `soft` / `dark` / `comic`                               |
| `tail`                             | `true`   | `false`で非表示。または `{ side, size, offset }`        |
| `tail.side`                        | `bottom` | しっぽを出す辺                                          |
| `tail.size`                        | `12`     | しっぽの正方形の一辺、px。0で非表示                     |
| `tail.offset`                      | `50%`    | 辺に沿ったしっぽの中心位置。numberはpx、stringはCSS長さ |
| `contentClassName`, `contentStyle` | —        | 本文のスクロール領域を調整                              |

通常のdivのHTML属性、`className`、`style`、DOM refを受け付けます。`tailRef` は外部の配置処理と組み合わせる場合に使います。

### Styling

```tsx
import { Bubble } from 'react-fukidashi';
import 'react-fukidashi/style.css';

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
  <p>次のステップへ</p>
  <button>続ける</button>
</Bubble>;
```

これらのCSS変数は `Fukidashi` でも使えます。`--fukidashi-max-width`（既定24rem）も変更できます。内部用の `--fukidashi-tail-*` と `--fukidashi-available-*` は、対応するpropsで設定してください。

位置計算と入退場のアニメーションは別の要素で処理するため、吹き出し本体の `transform` はそれらと競合しません。

## Fukidashi

アンカーに追従する吹き出しです。`Bubble` のprops（`tail`、`tailRef`を除く）に加えて以下を使えます。`children` は吹き出しの中身です。

| Prop                             | Default  | Description                                                                      |
| -------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `anchor`                         | 必須     | ReactNodeまたは `(props) => ReactNode`。render関数には `aria-describedby` を渡す |
| `open`                           | `true`   | 表示状態。閉じるアニメーション後に本文をアンマウント                             |
| `placement`                      | `top`    | top / right / bottom / left と各 `-start`、`-end`                                |
| `gap`                            | `10`     | アンカーとしっぽ先端の間隔、px                                                   |
| `tail`                           | `true`   | `false`または `{ size }`。辺・位置は自動計算                                     |
| `portal`                         | `true`   | document.bodyに配置。`false`でインライン、HTMLElementで任意の配置先              |
| `strategy`                       | `fixed`  | `fixed` / `absolute`                                                             |
| `avoidCollisions`                | `true`   | 反転・位置補正・利用可能領域に合わせたサイズ制限                                 |
| `collisionPadding`               | `12`     | 衝突判定の余白、px                                                               |
| `trackAnchor`                    | `false`  | transformで動くアンカーに毎フレーム追従                                          |
| `motion`                         | `pop`    | `pop` / `fade` / `slide` / `none`                                                |
| `duration`                       | `180`    | 入退場の時間、ms                                                                 |
| `reducedMotion`                  | `system` | `system` / `always` / `never`                                                    |
| `zIndex`                         | `1000`   | 配置用要素の重なり順                                                             |
| `anchorClassName`, `anchorStyle` | —        | アンカーを囲むinline-flexのspan                                                  |
| `onExitComplete`                 | —        | 閉じ終わったときに実行。途中で再表示したら取り消し                               |
| `role`                           | `note`   | 文脈に応じて変更。操作要素を含む本文にはtooltipを指定しない                      |

開閉のきっかけはアプリ側で決めます。クリック・hover・focus・会話の進行などに応じて `open` を制御してください。常時表示する場合は省略できます。

```tsx
import { useState } from 'react';
import { Fukidashi } from 'react-fukidashi';
import 'react-fukidashi/style.css';

export function Greeting() {
  const [open, setOpen] = useState(true);
  return (
    <Fukidashi
      open={open}
      anchor={(props) => (
        <button {...props} aria-expanded={open} onClick={() => setOpen(!open)}>
          話す
        </button>
      )}
    >
      こんにちは
    </Fukidashi>
  );
}
```

配置には `@floating-ui/react-dom` を使用します。スクロール、要素のリサイズ、レイアウト変更に追従し、利用できる高さを超えた本文はスクロールします。

`portal={false}` や独自のPortal先では、配置先のoverflow・transform・積層コンテキストが影響します。アンカーはinline-flexのspanで囲まれるため、tableなどではレイアウトに応じたラッパーを用意してください。

## Typewriter

文字送りを行うコンポーネントです。以下のオプションは、`cursor` と `reserveSpace` を除いて `useTypewriter` と共通です。

| Prop               | Default  | Description                                    |
| ------------------ | -------- | ---------------------------------------------- |
| `text`             | 必須     | string / readonly string[]。配列の要素間は改行 |
| `speed`            | `35`     | 書記素ごとの待ち時間、ms。0で即時表示          |
| `startDelay`       | `0`      | 最初の文字の前に追加する時間、ms               |
| `lineDelay`        | `250`    | 改行の後に追加する時間、ms                     |
| `punctuationDelay` | `140`    | 句読点の後に追加する時間、ms                   |
| `paused`           | `false`  | アプリ側で一時停止                             |
| `disabled`         | `false`  | 文字送りを無効にして全文を表示                 |
| `reducedMotion`    | `system` | `system` / `always` / `never`                  |
| `onComplete`       | —        | その再生の全文表示完了通知                     |
| `cursor`           | なし     | カーソルとして表示するReactNode。例：`"▍"`     |
| `reserveSpace`     | `true`   | 全文相当の領域を先に確保                       |

spanのHTML属性も受け付けます。refはDOMではなく `TypewriterControls` です。最初の文字は `startDelay + speed` 後に表示します。負の時間は0、NaN・Infinityは既定値として扱います。

### Controls

```tsx
import { useRef } from 'react';
import { Typewriter, type TypewriterControls } from 'react-fukidashi';
import 'react-fukidashi/style.css';

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

停止中は次の文字までの残り時間を保持します。速度を変更しても表示済みの文字は消えません。`text` の内容が変わると再生をやり直します。同じ内容の配列や新しいコールバックを渡しても再生し直しません。

`onComplete` は全文表示または `skip()` 時に一度だけ呼ばれ、アンマウントでは呼ばれません。`reset()` 後は再び完了通知の対象になります。空文字も完了として扱います。`paused={true}` はrefの `resume()` より優先されます。

## useTypewriter

`Typewriter` と同じ文字送りを、任意の描画と組み合わせるためのフックです。

```tsx
import { useTypewriter } from 'react-fukidashi';

export function CustomText() {
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

戻り値は `text`、`visibleText`、`progress`（0〜1）、`status`（typing / paused / complete）、`isComplete` と、`pause()` / `resume()` / `skip()` / `reset()` です。

## Accessibility / SSR

`Typewriter` は全文を支援技術向けに公開し、文字ごとの視覚表示を `aria-hidden` にします。文字送りのたびにlive regionを更新しません。段落単位の通知などが必要な場合はアプリ側で設定してください。

OSの動きを減らす設定に応じて、入退場と文字送りは即時表示になります。`reducedMotion="always"` で常に無効化、`"never"` でOS設定を上書きできます。`useReducedMotion` で同じ設定を参照できます。

`Fukidashi` はメニューやモーダルダイアログの操作を提供しません。focus trap、Escape、外側クリック、フォーカス復帰はアプリ側で実装してください。退出中の本文は `aria-hidden` / `inert` で操作対象から外します。`aria-describedby` は簡潔な補足説明に使い、複雑な操作UIでは用途に応じたroleとフォーカス設計を用意してください。

ESM/CJS双方でSSRに対応し、モジュール読み込み時にwindow/documentへアクセスしません。`Bubble` と `Typewriter` はサーバーで描画され、Portalの吹き出しはマウント後に配置されます。配布物には `use client` 境界を保持しています。

ブラウザーでは `Intl.Segmenter`、ResizeObserver、inertを使用します。`Intl.Segmenter` がない環境では全文を一つの単位として表示します。
