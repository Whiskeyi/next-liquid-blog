const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGithubProjectPage =
  process.env.GITHUB_PAGES === "true" &&
  Boolean(repoName) &&
  !repoName?.endsWith(".github.io");

const basePath = isGithubProjectPage ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  turbopack: {
    root: process.cwd()
  },
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
