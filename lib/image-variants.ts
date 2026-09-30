import {
  getImageVariantRelativePath,
  IMAGE_VARIANT_WIDTHS,
  isOptimizableImagePath
} from "@/lib/image-variant-contract.mjs";
import { withBasePath } from "@/lib/site";

type ResponsiveImageSource = {
  src: string;
  srcSet?: string;
};

const REMOTE_IMAGE_PATTERN = /^(?:https?:)?\/\//;

function withoutBasePath(src: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (basePath && src.startsWith(`${basePath}/`)) return src.slice(basePath.length);
  return src;
}

function ensureBasePath(src: string): string {
  if (REMOTE_IMAGE_PATTERN.test(src) || src.startsWith("data:")) return src;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (basePath && (src === basePath || src.startsWith(`${basePath}/`))) return src;
  return withBasePath(src);
}

export function getResponsiveImageProps(src: string, sourceWidth?: number): ResponsiveImageSource {
  const originalSrc = ensureBasePath(src);
  if (!sourceWidth || !isOptimizableImagePath(src) || REMOTE_IMAGE_PATTERN.test(src) || src.startsWith("data:")) {
    return { src: originalSrc };
  }

  const publicRelativePath = withoutBasePath(src).replace(/^\/+/, "");
  const candidates: Array<{ src: string; width: number }> = IMAGE_VARIANT_WIDTHS.filter(
    (width) => width <= sourceWidth
  ).map((width) => ({
    src: withBasePath(`/${getImageVariantRelativePath(publicRelativePath, width)}`),
    width
  }));

  if (!candidates.some(({ width }) => width === sourceWidth)) {
    candidates.push({ src: originalSrc, width: sourceWidth });
  }

  if (candidates.length === 0) return { src: originalSrc };

  return {
    src: originalSrc,
    srcSet: candidates
      .sort((left, right) => left.width - right.width)
      .map((candidate) => `${candidate.src} ${candidate.width}w`)
      .join(", ")
  };
}
