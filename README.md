# react-fukidashi

💭 react speech balloon component

[![npm version](https://img.shields.io/npm/v/react-fukidashi)](https://www.npmjs.com/package/react-fukidashi)
[![CI](https://github.com/ivgtr/react-fukidashi/actions/workflows/ci.yml/badge.svg)](https://github.com/ivgtr/react-fukidashi/actions/workflows/ci.yml)

## Demo

[Demo Site](https://ivgtr.github.io/react-fukidashi/)

## Usage

The examples below use the v2 development API. See [Development](#development) to try it locally and [Migration](MIGRATION.md) for changes from v1.

Requires React / React DOM `^18.3.1 || ^19.0.0`.

```tsx
import { Fukidashi, Typewriter } from 'react-fukidashi';
import 'react-fukidashi/style.css';

<Fukidashi anchor={(props) => <button {...props}>話す</button>} placement="top">
  <Typewriter text="こんにちは" speed={35} />
</Fukidashi>;
```

Use `open` to control visibility, or pass any React content instead of `Typewriter`.

### Components

| API                | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `Bubble`           | A speech bubble in the normal layout                        |
| `Fukidashi`        | A speech bubble positioned next to an anchor                |
| `Typewriter`       | Text with a typewriter effect                               |
| `useTypewriter`    | Typewriter state and playback controls for custom rendering |
| `useReducedMotion` | The reduced-motion preference                               |

`Bubble` and `Fukidashi` accept `className`, `style` and CSS variables for colors, borders, spacing and size.

See the [API reference](https://github.com/ivgtr/react-fukidashi/blob/main/API.md) for props, styling and playback controls.

## Development

Node.js 22.12 or later (24 recommended).

```sh
git clone https://github.com/ivgtr/react-fukidashi.git
cd react-fukidashi
npm ci
npm run dev
```

Open `http://127.0.0.1:4173` for the playground. Run `npm run check` for type checks, tests and builds.

## License

MIT © [ivgtr](https://github.com/ivgtr)
