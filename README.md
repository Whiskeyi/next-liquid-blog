# Next Liquid Blog

A clean, static Next.js blog for long-form technical notes and reading-focused publishing.

## Stack

- Next.js App Router with static export
- React 19 and TypeScript
- React Markdown with GFM, safe raw HTML, heading anchors, and Shiki highlighting
- GitHub Pages-friendly build output

## Commands

```bash
pnpm install
pnpm dev
pnpm build
```

`pnpm build` writes the static site to `out/`.

## GitHub Pages

For a user site such as `Whiskeyi.github.io`, publish the `out/` folder directly. For a project page, set `GITHUB_PAGES=true` during build so the repository name is applied as `basePath`.
