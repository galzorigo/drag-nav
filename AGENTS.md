# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# mobile-lab

A playground for web-mobile interaction experiments. Every experiment lives under
`app/<experiment>/` and renders inside the shared `<PhoneFrame>` — an iPhone
simulator on desktop, fullscreen on a real phone.

- Icons: `@hugeicons/react` + `@hugeicons/core-free-icons`.
- Motion: `motion/react`. Gesture-driven values use springs, never CSS transitions.
- Motion bar: the `animate` / `apple-design` skills in `.agents/skills/`.
