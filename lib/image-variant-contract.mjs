export const IMAGE_VARIANT_WIDTHS = [480, 960, 1440, 2160];
export const IMAGE_VARIANT_QUALITY = 82;

const OPTIMIZABLE_IMAGE_PATTERN = /\.(?:jpe?g|png)$/i;

export function isOptimizableImagePath(value) {
  return OPTIMIZABLE_IMAGE_PATTERN.test(value.split(/[?#]/, 1)[0]);
}

export function getImageVariantRelativePath(publicRelativePath, width) {
  if (!IMAGE_VARIANT_WIDTHS.includes(width)) {
    throw new RangeError(`Unsupported image variant width: ${width}`);
  }

  const normalized = publicRelativePath.replace(/^\/+/, "").replace(/\.[^.\/]+$/, "");
  return `image-variants/${normalized}-${width}.webp`;
}
