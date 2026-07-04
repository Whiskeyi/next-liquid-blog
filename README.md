# Next Liquid Blog

A static Next.js blog template for technical notes, long-form writing, and GitHub Pages publishing.

Suggested GitHub repository description:

> A static Next.js blog template for technical notes, long-form writing, and GitHub Pages publishing.

## Stack

- Next.js App Router with static export
- React 19 and TypeScript
- React Markdown with GFM, safe raw HTML, heading anchors, and Shiki highlighting
- GitHub Pages-friendly build output

## Customize

Most site-level settings live in one file:

```text
lib/site.ts
```

Edit this file to change the site name, author, metadata, production URL, navigation, social links, homepage hero content, About page copy, timeline items, and hero images.

Common fields to update first:

- `name`, `title`, `author`, `description`, and `url`
- `links.github` and `links.email`
- `navigation`
- `home.heroImages`, `home.heroTitle`, and `home.feedDescription`
- `about.description`, `about.heroImage`, and `about.timeline`

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

This repository includes `.github/workflows/deploy.yml`. After pushing your copy of the project, enable Pages in the repository settings:

1. Go to `Settings` -> `Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to the `main` branch.

The workflow installs dependencies with pnpm, runs `pnpm build`, uploads `out/`, and deploys it to GitHub Pages.

For a project page, the workflow can infer the base path from the repository name. For a custom domain or a custom base path, add repository variables under `Settings` -> `Secrets and variables` -> `Actions`:

- `NEXT_PUBLIC_SITE_URL`: the public site URL, for example `https://example.com`
- `GITHUB_PAGES_CUSTOM_DOMAIN`: set to `true` when deploying to a custom domain
- `GITHUB_PAGES_BASE_PATH`: optional override for the generated base path

If you use a custom domain, configure it in GitHub Pages settings. You can also add a `public/CNAME` file with the domain name if your Pages setup requires it.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE).
