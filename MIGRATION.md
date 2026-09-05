# v1 → v2 移行ガイド

v2は破壊的変更を含む再構築です。旧実装を残す互換モードはなく、以下のAPIへ移行します。v1を使用しているアプリでは、2.0.0への更新時に以下の変更が必要です。

## Before / After

```tsx
// v1: childrenがアンカー、textが本文
<Fukidashi
  text={['こんにちは', '次の行']}
  placement="top"
  width={300}
  gap={50}
  delay={1000}
  onSpeechingDone={onDone}
>
  <button>Anchor</button>
</Fukidashi>
```

```tsx
// v2: anchorがアンカー、childrenが任意の本文
<Fukidashi
  anchor={(props) => <button {...props}>Anchor</button>}
  placement="top"
  gap={10}
  style={{ '--fukidashi-width': '300px' }}
>
  <Typewriter text={['こんにちは', '次の行']} lineDelay={1000} onComplete={onDone} />
</Fukidashi>
```

```tsx
import { Fukidashi, Typewriter } from 'react-fukidashi';
import 'react-fukidashi/style.css'; // CSSの公開パスは維持
```

| v1                    | v2                                                                       |
| --------------------- | ------------------------------------------------------------------------ |
| children = アンカー   | `anchor` prop。childrenは本文                                            |
| textをFukidashiに渡す | `<Typewriter text={...} />` を本文に入れる                               |
| width={300}           | styleの `--fukidashi-width: '300px'`。CSS長さが利用可能                  |
| delay                 | Typewriterの `lineDelay`。別途 `speed`, `startDelay`, `punctuationDelay` |
| onSpeechingDone       | Typewriterの `onComplete`                                                |
| 4方向固定             | 12配置と自動反転・画面内補正                                             |
| 常時表示              | `open` で制御、閉じるアニメーション後にアンマウント                      |
| 固定色・固定枠        | variant、CSS変数、className、style                                       |
| React 16 / 17         | React / React DOM 18.3.1または19                                         |
| UMD/ESM               | ESM/CJS、各型宣言、CSS。UMDのscriptタグ読込は廃止                        |

## 意味が変わる部分

`onSpeechingDone` は旧実装ではEffectのcleanupから呼ばれていました。v2の `onComplete` は**文字の表示が本当に終わったとき**に一度だけ呼び、skipでも呼びます。アンマウント時は呼びません。閉じ終わった通知が必要なら `Fukidashi.onExitComplete` を使います。

幅の既定は固定300pxではなく内容に応じた幅（上限24rem）です。gapの既定は50pxから10pxとなり、しっぽの先端とアンカーの間隔として扱います。文字速度の既定は100msから35ms、行の追加待ち時間は1000msから250msです。完全に旧テンポへ寄せるなら `speed={100} lineDelay={1000} punctuationDelay={0}` を指定します。

入退場は `motion="pop"` が既定です。動きを止めるには `motion="none"`、文字送りを止めるには `Typewriter.disabled` または `speed={0}` を使います。OSのreduced motion設定も既定で尊重します。

`portal` は既定でdocument.bodyです。祖先のCSSによる継承、セレクター、積層順が変わるため、吹き出し自身のstyle/classNameを調整してください。元のDOM位置に置く必要があるときだけ `portal={false}` を使用します。

## 置き換え後の確認

- 文字送りを使わないメッセージはTypewriterなしで直接childrenへ渡す。
- アンカーを説明に関連付ける場合はrender関数から `aria-describedby` を実際のボタン等へ渡す。
- 閉じた後の再表示ではTypewriterが新しくマウントされ、最初から再生する。状態を長く保持したい用途では `useTypewriter` を親で使って描画する。
- `Bubble` を使うチャットは通常のCSSレイアウトに配置する。すべてをアンカー付きにする必要はない。
- SSR/RSCではCSSをアプリのエントリーで読み込む。Portalの吹き出しがマウント後に現れることを考慮する。
