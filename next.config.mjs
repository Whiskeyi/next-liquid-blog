const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const hasCustomDomain = process.env.GITHUB_PAGES_CUSTOM_DOMAIN === "true";
const configuredBasePath = process.env.GITHUB_PAGES_BASE_PATH;
const isGithubProjectPage =
  process.env.GITHUB_PAGES === "true" &&
  Boolean(repoName) &&
  !repoName?.endsWith(".github.io") &&
  !hasCustomDomain;

function normalizeBasePath(value) {
  if (!value || value === "/") {
    return "";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

const basePath =
  configuredBasePath === undefined
    ? isGithubProjectPage
      ? `/${repoName}`
      : ""
    : normalizeBasePath(configuredBasePath);

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
