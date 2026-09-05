# API

v2のpropsと詳しい使い方です。基本の使用例は [README](README.md)、v1からの変更点は [Migration](MIGRATION.md) を参照してください。

## Bubble

通常のレイアウトに置く吹き出しです。`children` に任意のReact要素を渡せます。divのHTML属性、`className`、`style`、DOM refも受け付けます。

- `variant`: `soft`（既定）/ `dark` / `comic`。
- `tail`: `true`（既定）/ `false` / `{ side, size, offset }`。`false` でしっぽを非表示にします。
- `tail.side`: `top` / `right` / `bottom`（既定）/ `left`。しっぽを出す辺です。
- `tail.size`: しっぽの正方形の一辺、px。既定は `12`、`0` で非表示です。
- `tail.offset`: 辺に沿ったしっぽの中心位置。既定は `'50%'`、numberはpx、stringはCSSの長さです。
- `contentClassName`, `contentStyle`: 本文のスクロール領域を調整します。
- `tailRef`: 位置計算を自作する場合のしっぽ要素へのrefです。

## Fukidashi

アンカーに追従する吹き出しです。`children` は吹き出しの中身、`anchor` は配置の基準です。`Bubble` のpropsも使えますが、`tailRef` は受け付けず、`tail` の辺と位置は自動計算します。

- `anchor`: 必須。ReactNode、または `(props) => ReactNode`。render関数には `aria-describedby` を渡します。
- `open`: 表示状態。既定は `true`。閉じるアニメーション後に本文をアンマウントします。
- `placement`: `top`（既定）/ `right` / `bottom` / `left` と、それぞれの `-start` / `-end`。
- `gap`: アンカーとしっぽ先端の間隔、px。既定は `10`。
- `tail`: `true`（既定）/ `false` / `{ size }`。
- `portal`: `true`（既定）で `document.body` に配置。`false` でインライン、HTMLElementで任意の配置先を指定します。
- `strategy`: `fixed`（既定）/ `absolute`。
- `avoidCollisions`: 画面端での反転・位置補正・利用可能領域に合わせたサイズ制限。既定は `true`。
- `collisionPadding`: 衝突判定の余白、px。既定は `12`。
- `trackAnchor`: transformで動くアンカーに毎フレーム追従します。既定は `false`。
- `motion`: `pop`（既定）/ `fade` / `slide` / `none`。
- `duration`: 入退場の時間、ms。既定は `180`。
- `reducedMotion`: `system`（既定）/ `always` / `never`。
- `zIndex`: 配置用要素の重なり順。既定は `1000`。
- `anchorClassName`, `anchorStyle`: アンカーを囲むinline-flexのspanを調整します。
- `onExitComplete`: 閉じ終わったときに実行します。途中で再表示した場合は取り消します。
- `role`: 既定は `note`。インタラクティブな本文には `tooltip` を指定しないでください。

開閉のきっかけはアプリ側で決めます。クリック・hover・focusなどに合わせて `open` を制御してください。常時表示するなら省略できます。

画面や祖先のスクロール、要素のリサイズ、レイアウト変更を追跡します。利用できる高さを超える本文はスクロールします。`portal={false}` や独自のPortal先では、その配置先のoverflow・transform・積層コンテキストが影響します。アンカーはspanで囲まれるため、tableなどでは適切なラッパーを用意してください。

## Styling

`Bubble` / `Fukidashi` の `style`、または独自クラスでCSS変数を変更できます。CSSは別途読み込んでください。

```tsx
import { Bubble } from 'react-fukidashi';
import 'react-fukidashi/style.css';

<Bubble
  variant="comic"
  tail={{ side: 'left', offset: '30%', size: 16 }}
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
  <p>文字以外も入れられます。</p>
</Bubble>;
```

`--fukidashi-max-width`（既定 `24rem`）も変更できます。通常の `style` や `className` も使えます。内部用の `--fukidashi-tail-*`・`--fukidashi-available-*` は直接変更せず、対応するpropsを使ってください。

ルートの `transform` は、配置計算と入退場用の要素から分離しています。

## Typewriter / useTypewriter

`Typewriter` は文字送りを描画するコンポーネント、`useTypewriter` は描画を自作するためのフックです。次のオプションを共通で受け付けます。

- `text`: 必須。string / readonly string[]。配列の要素間には改行を入れます。
- `speed`: 書記素ごとの待ち時間、ms。既定は `35`、`0` で即時表示します。
- `startDelay`: 最初の文字の前に追加する時間、ms。既定は `0`。
- `lineDelay`: 改行の後に追加する時間、ms。既定は `250`。
- `punctuationDelay`: 句読点の後に追加する時間、ms。既定は `140`。
- `paused`: アプリ側で一時停止します。既定は `false`。
- `disabled`: 文字送りを無効にして全文を表示します。既定は `false`。
- `reducedMotion`: `system`（既定）/ `always` / `never`。
- `onComplete`: その再生の全文表示が完了したときに呼びます。

最初の文字は `startDelay + speed` 後に表示します。時間の負の値は0、NaN・Infinityは既定値として扱います。

`Typewriter` はspanのHTML属性と、次のpropsも受け付けます。

- `cursor`: カーソルとして描画するReactNode。既定はなし。例: `'▍'`。
- `reserveSpace`: 全文を一つのテキストノードとして配置し、CSS Custom Highlight APIで未表示範囲を隠します。折り返し・字間・合字を保ったまま書記素単位で表示します。既定は `true`。`false` は表示済み文字だけでレイアウトするため、途中で折り返し位置が変わります。
- `ref`: DOMではなく `TypewriterControls` を受け取ります。

### Controls

`Typewriter` のrefと `useTypewriter` は、`pause()`・`resume()`・`skip()`・`reset()` を提供します。

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
        text={['最初の行。', '次の行。']}
        speed={35}
        startDelay={200}
        onComplete={() => console.log('全文の表示が完了')}
      />
      <button type="button" onClick={() => typing.current?.pause()}>
        停止
      </button>
      <button type="button" onClick={() => typing.current?.resume()}>
        再開
      </button>
      <button type="button" onClick={() => typing.current?.skip()}>
        全文表示
      </button>
      <button type="button" onClick={() => typing.current?.reset()}>
        最初から
      </button>
    </>
  );
}
```

領域確保中は文字送りの完了を待たずに全文を選択・コピーできます。カーソルと読み上げ用テキストはコピーに重複しません。`reserveSpace={false}` では表示済み文字だけが対象です。幅・フォントが変わった場合は通常のテキストと同様に再レイアウトされます。CSS Custom Highlight API非対応の環境では、領域確保モードの文字送りを省略して全文を表示します（完了通知も一度だけ行います）。

タイマーは一つだけ使い、停止中は残り時間を保持します。速度を変えても表示済みの文字は消しません。`text` の内容が変わると新しい再生に切り替えます。同じ内容の配列や新しいコールバックを渡しても再生し直しません。

`onComplete` は全文表示または `skip()` 時に一度だけ呼び、アンマウント時には呼びません。`reset()` すると再度通知の対象になります。空文字も完了と扱います。`paused={true}` はrefの `resume()` では解除できません。

`useTypewriter` は操作に加え、`text`・`visibleText`・`progress`（0〜1）・`status`（typing / paused / complete）・`isComplete` を返します。描画を自作する場合は、全文を支援技術に公開し、文字送り中の視覚表示を `aria-hidden` にするなどの対応も行ってください。

## useReducedMotion

`useReducedMotion(preference = 'system')` は動きを減らすかどうかをbooleanで返します。`system` はOSの設定とその変更に追従し、`always` は常にtrue、`never` は常にfalseです。

## Accessibility / SSR

`Typewriter` は全文をスクリーンリーダー向けに一つだけ配置し、文字送りの視覚表示は `aria-hidden` にします。文字ごとのlive-region通知は行いません。読み上げのタイミングを制御したい場合は、アプリ側で適切なlive regionを設けてください。

OSが動きを減らす設定なら入退場を即時化し、文字送りも全文表示にします。`reducedMotion="always"` で明示的に無効化できます。`never` はOSの設定を上書きします。

`Fukidashi` はメニューやモーダルの代替ではありません。focus trap、Escape、外側クリック、フォーカス復帰は提供しません。退出中の本文は `aria-hidden` / `inert` で操作対象から外します。アンカーの `aria-describedby` は簡潔な補足説明向けです。複雑な操作UIでは、用途に合ったroleとフォーカス制御をアプリ側で用意してください。

モジュール読み込み時にwindow/documentへアクセスしません。ESM/CJS双方でSSRでき、Portalの吹き出しはマウント後に配置します。配布物にも `use client` を保持します。`Intl.Segmenter`・ResizeObserver・inertを持つ環境を推奨します。Segmenterがない環境では、全文を一つの単位として表示します。

## Development

起動手順は [README](README.md#development) を参照してください。

```sh
npm run check
npx playwright install chromium firefox webkit
npm run test:e2e
npm run test:consumer
npm run build
npm run build:docs
```

`check` は型チェック・単体テスト・ビルド・配布物検査・デモのビルド・整形確認を実行します。`test:e2e` はChromium・Firefox・WebKitでの回帰テスト、`build` は `dist/`、`build:docs` は `docs/` への出力です。`test:consumer` は実際のtarballをリポジトリ外のReactアプリへインストールし、ESM/CJS・SSR・型解決・CSS・本番ビルドを確認します。CIではその本番アプリも3エンジンで描画します。WebKitの自動テストは実機Safariの確認とは異なり、実機スクリーンリーダーとともに別途確認が必要です。

npm公開はGitHub Releaseから行います。タグとpackage.jsonのversionが一致した場合のみ公開し、プレリリースは `beta`、安定版は `latest` を使います。PRの作成・マージだけでは公開しません。
