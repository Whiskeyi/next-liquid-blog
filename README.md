# Next Liquid Blog

A static Next.js blog for technical notes, long-form reading, and GitHub Pages publishing.

Suggested GitHub repository description:

> A static Next.js blog for technical notes, long-form reading, and GitHub Pages publishing.

## Stack

- Next.js App Router with static export
- React 19 and TypeScript
- React Markdown with GFM, safe raw HTML, heading anchors, and Shiki highlighting
- GitHub Pages-friendly build output

## Commands

Use Node.js 22, matching the GitHub Pages workflow.

```bash
nvm use
pnpm install
pnpm new:post
pnpm dev
pnpm build
```

`pnpm build` writes the static site to `out/`.

## Content

Each article lives in its own folder under `content/posts`:

```text
content/posts/my-post-slug/
  index.md
  imgs/
    head.jpg
    example.png
```

Use paths like `imgs/example.png` in markdown and `header-img: imgs/head.jpg` in frontmatter. The source images stay beside the article; `pnpm dev` and `pnpm build` sync them to `public/post-assets` so the static export can serve them.

Create a new article template with:

```bash
pnpm new:post
```

You can also skip the prompts:

```bash
pnpm new:post -- --title "My Post" --slug 2026-07-05-my-post --tags React,Next.js --categories Frontend
```

The command creates `content/posts/<slug>/index.md` and `content/posts/<slug>/imgs/`. Copy the article body into `index.md`, then copy images into `imgs/` and reference them as `imgs/example.png`.

## GitHub Pages

This repository includes `.github/workflows/deploy.yml`. After pushing to `Whiskeyi/next-liquid-blog`, enable Pages in the repository settings:

1. Go to `Settings` -> `Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to the `main` branch.

The workflow installs dependencies with pnpm, runs `pnpm build`, uploads `out/`, and deploys it to GitHub Pages. This repository includes `public/CNAME` for the custom domain `blog.zhuchj.com`, so the workflow publishes the site at the custom domain root.

If you switch to the default project page URL, such as `https://whiskeyi.github.io/next-liquid-blog/`, remove `public/CNAME` and remove `GITHUB_PAGES_CUSTOM_DOMAIN` from the workflow.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE).
