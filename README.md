# react-fukidashi

💭 react speech balloon component

[![npm version](https://img.shields.io/npm/v/react-fukidashi)](https://www.npmjs.com/package/react-fukidashi)
[![CI](https://github.com/ivgtr/react-fukidashi/actions/workflows/ci.yml/badge.svg)](https://github.com/ivgtr/react-fukidashi/actions/workflows/ci.yml)
[![gh-pages CI](https://github.com/ivgtr/react-fukidashi/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/ivgtr/react-fukidashi/actions/workflows/deploy.yml)

## Demo

[demo](https://ivgtr.github.io/react-fukidashi/)

## Usage

```sh
npm install react-fukidashi
```

React / React DOM 18.3.1以降の18系、または19系に対応しています。

```tsx
import { Fukidashi, Typewriter } from 'react-fukidashi';
import 'react-fukidashi/style.css';

<Fukidashi placement="top" anchor={(props) => <button {...props}>アンカー</button>}>
  <Typewriter text="喋る内容" speed={35} />
</Fukidashi>;
```

`open` で表示を切り替え、`variant`・`tail`・`style` で見た目を調整できます。

### Chat

v2では `Bubble` と `Typewriter` を別々に使えます。例えば、アンカーなしの会話表示に文字送りを付け、ボタンから `skip()` で全文を表示できます。

```tsx
import { useRef } from 'react';
import { Bubble, Typewriter, type TypewriterControls } from 'react-fukidashi';
import 'react-fukidashi/style.css';

export function Chat() {
  const typing = useRef<TypewriterControls>(null);

  return (
    <Bubble variant="comic" tail={{ side: 'left' }}>
      <p>
        <Typewriter ref={typing} text="こんにちは。今日は何をしよう？" speed={40} />
      </p>
      <button type="button" onClick={() => typing.current?.skip()}>
        全文表示
      </button>
    </Bubble>
  );
}
```

## API

props・CSS変数・文字送りの操作は [API](https://github.com/ivgtr/react-fukidashi/blob/main/API.md)、v1からの変更点は [Migration](MIGRATION.md) を参照してください。

## Development

```sh
git clone https://github.com/ivgtr/react-fukidashi.git
cd react-fukidashi
npm ci
npm run dev
```

Node.js 22.12以上を使用してください。`http://127.0.0.1:4173` でプレイグラウンドが開きます。型チェック・テスト・ビルドは `npm run check` で実行できます。

## License

MIT ©[ivgtr](https://github.com/ivgtr)
