# react-fukidashi

💭 react speech balloon component

[![npm version](https://img.shields.io/npm/v/react-fukidashi)](https://www.npmjs.com/package/react-fukidashi)
[![gh-pages CI](https://github.com/ivgtr/react-fukidashi/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/ivgtr/react-fukidashi/actions/workflows/deploy.yml)
[![Publish CI](https://github.com/ivgtr/react-fukidashi/actions/workflows/publish.yml/badge.svg)](https://github.com/ivgtr/react-fukidashi/actions/workflows/publish.yml)

## Demo

[demo](https://ivgtr.github.io/react-fukidashi/)

## Usage

```
npm install react-fukidashi
```

```tsx
import { Fukidashi } from 'react-fukidashi';
import 'react-fukidashi/style.css';

<Fukidashi placement="bottom" text="喋る内容">
  ... // base contents
</Fukidashi>
```

### props
Property | Type | Default | Description | Required
--- | --- | --- | --- | ---
text | string or string[] |  | speeching text | yes
placement | `top` or `right` or `bottom` or `left` | `top` | speech bubble placement | no



### future

- コンポーネントを複数設置してキュー順に会話できるようになるといいね



## License

MIT ©[ivgtr](https://github.com/ivgtr)

[![Twitter Follow](https://img.shields.io/twitter/follow/ivgtr?style=social)](https://twitter.com/ivgtr) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)