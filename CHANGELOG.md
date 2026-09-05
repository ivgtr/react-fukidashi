# Changelog

## 2.0.0-beta.0 — unreleased

A breaking rebuild focused on composability, customization and reliable animation.

- Separate standalone Bubble, anchored Fukidashi, Typewriter and useTypewriter APIs.
- Add CSS tokens, three visual presets, arbitrary React content, DOM attributes and refs.
- Add 12 placements, collision handling, anchor tracking, portals and independent positioning/motion layers.
- Add cancellable enter/exit transitions, retained exiting content and reduced-motion support.
- Replace the old timer tree and random keys with one cancellable typewriter timer, grapheme segmentation, pause/resume, skip, reset and correct completion events.
- Reserve text layout and expose the full message once to assistive technology.
- Replace the Linaria/Sass/Vite 2 build with typed ESM/CJS output and a separate Vite playground.
- Add unit, SSR, package and Chromium regression tests; React 18/19 CI; modernize Pages and release workflows.
- Remove React 16/17 and UMD support; provide MIGRATION.md instead of a parallel compatibility implementation.
