# Aurum Chat — Netlify Package (Full Preview)

This repo is ready for Netlify.

## Deploy instructions
1) **Netlify → New site from Git** or drag & drop after `npm run build`.

2) Ensure the `Publish directory` is `dist`.

3) If you see `File Not Found`, it's a Single Page App routing issue — we added both a `_redirects` file *and* a `netlify.toml` rule that maps `/*` → `/index.html` (status 200).

## Scripts
- `npm run dev` — local dev
- `npm run build` — production build
- `npm run preview` — local preview of the dist

## Functions (stubs)
- `/.netlify/functions/profile`
- `/.netlify/functions/webhook`
