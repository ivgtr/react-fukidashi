import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { App } from './ssr/app.js';

const html = readFileSync('dist/index.html', 'utf8');
const markup = renderToString(createElement(StrictMode, null, createElement(App)));
writeFileSync(
  'dist/index.html',
  html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`),
);
