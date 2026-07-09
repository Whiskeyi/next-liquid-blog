# Next Liquid Blog

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个用于技术笔记、长文写作与 GitHub Pages 发布的静态 Next.js 博客模板。

## 技术栈

- 使用 Next.js App Router 与静态导出
- React 19 与 TypeScript
- React Markdown，支持 GFM、安全的原始 HTML、标题锚点与 Shiki 代码高亮
- 适合部署到 GitHub Pages 的构建产物

## 全局配置

大多数站点级配置都集中在一个文件中：

```text
lib/site.ts
```

编辑该文件可以修改站点名称、作者、元信息、生产环境 URL、导航、社交链接、首页 Hero 内容、关于页文案、时间线条目和 Hero 图片。

建议优先更新的常用字段：

- `name`、`title`、`author`、`description` 和 `url`
- `links.github`
- `navigation`
- `home.heroImages`、`home.heroTitle` 和 `home.feedDescription`
- `about.description`、`about.heroImage` 和 `about.timeline`

当你克隆这个模板创建新博客时，这里通常是第一个需要修改的地方。它控制全局品牌、顶部导航、首页、关于页以及可复用的 Hero 图片资源。

## 命令

使用 Node.js 22，与 GitHub Pages 工作流保持一致。

```bash
nvm use
pnpm install
pnpm new:post
pnpm dev
pnpm build
```

`pnpm build` 会把静态站点输出到 `out/`。

## 从命令行创建文章

使用内置命令可以创建文章目录、`index.md` 和图片目录：

```bash
pnpm new:post
```

交互式命令会询问文章标题和 slug。也可以直接传入参数：

```bash
pnpm new:post -- --title "My Post" --slug 2026-07-05-my-post --subtitle "Short summary" --tags React,Next.js --categories Frontend
```

常用选项：

- `--title`：文章标题
- `--slug`：`content/posts` 下的目录名
- `--subtitle`：文章副标题
- `--tags`：用逗号分隔的标签
- `--categories`：用逗号分隔的分类
- `--cover`：文章目录中的封面路径，默认是 `imgs/head.jpg`
- `--dry-run`：只打印目标路径，不写入文件

## 内容

每篇文章都位于 `content/posts` 下的独立目录中：

```text
content/posts/my-post-slug/
  index.md
  imgs/
    head.jpg
    example.png
```

在 Markdown 中使用 `imgs/example.png` 这样的路径，在 frontmatter 中使用 `header-img: imgs/head.jpg`。源图片会和文章放在一起；`pnpm dev` 和 `pnpm build` 会将它们同步到 `public/post-assets`，以便静态导出后可以正常访问。

`pnpm new:post` 会创建 `content/posts/<slug>/index.md` 和 `content/posts/<slug>/imgs/`。在 `index.md` 中写正文，然后把图片复制到 `imgs/`，并用 `imgs/example.png` 这样的相对路径引用。

## 移动端视频

文章媒体资源建议靠近文章源文件。把移动端视频资源放到文章的 `imgs/` 目录中，例如：

```text
content/posts/my-post-slug/
  index.md
  imgs/
    demo-mobile.mp4
    demo-poster.jpg
```

推荐的移动端视频规则：

- 优先使用短小、压缩过的 MP4 片段，并提供封面图。
- 面向手机演示时，使用竖屏或接近竖屏的裁剪。
- 避免带声音自动播放，让读者自行选择播放时机。
- 将说明文字放在视频外部，确保小屏幕上仍然易读。
- 对于较大的视频，建议链接到视频文件或外部托管页面，而不是强制嵌入正文。

当前 Markdown 渲染器主要针对图片和代码块做了优化。如果需要内联 HTML5 视频播放器，请先扩展 `components/markdown-renderer.tsx`，允许并渲染 `video` 和 `source` 标签，然后再在文章中使用内联 `<video>`。

## 交互体验设计

这个模板围绕长文阅读设计，而不是营销落地页。交互应保持克制、快速且有帮助：

- 桌面端文章使用固定的目录，方便浏览长文。
- 移动端文章提供浮动阅读工具栏，用于目录、字号调整和快速回到顶部。
- 标题锚点让深链接更容易复制和分享。
- 图片支持缩放/灯箱交互，便于查看细节。
- 动效遵循 `prefers-reduced-motion`，并应能优雅降级。
- 移动端控件应保持舒适的点击区域，避免遮挡正文。

## GitHub Pages

该仓库包含 `.github/workflows/deploy.yml`。推送你的项目副本后，在仓库设置中启用 Pages：

1. 进入 `Settings` -> `Pages`。
2. 将 `Source` 设置为 `GitHub Actions`。
3. 推送到 `main` 分支。

工作流会使用 pnpm 安装依赖，执行 `pnpm build`，上传 `out/`，并部署到 GitHub Pages。

对于项目页面，工作流可以从仓库名推断 base path。如果使用自定义域名或自定义 base path，请在 `Settings` -> `Secrets and variables` -> `Actions` 下添加仓库变量：

- `NEXT_PUBLIC_SITE_URL`：公开站点 URL，例如 `https://example.com`
- `GITHUB_PAGES_CUSTOM_DOMAIN`：部署到自定义域名时设置为 `true`
- `GITHUB_PAGES_BASE_PATH`：可选，用于覆盖生成的 base path

如果使用自定义域名，请在 GitHub Pages 设置中配置。若你的 Pages 配置需要，也可以添加包含域名的 `public/CNAME` 文件。

## 许可证

基于 Apache License, Version 2.0 授权。详见 [LICENSE](./LICENSE)。
