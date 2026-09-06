import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './app';

const container = document.getElementById('root')!;
const bubble = container.querySelector('.fukidashi-bubble');
const text = container.querySelector('.fukidashi-typewriter-visible')?.firstChild;
hydrateRoot(
  container,
  <StrictMode>
    <App />
  </StrictMode>,
  {
    onRecoverableError(error) {
      container.dataset.hydrationError = String(error);
      console.error(error);
    },
  },
);
// The browser checks these exact server nodes after effects have committed.
Object.assign(window, { serverNodes: { bubble, text } });
