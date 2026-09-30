export const IMAGE_VARIANT_WIDTHS: readonly [480, 960, 1440, 2160];
export const IMAGE_VARIANT_QUALITY: 82;

export function isOptimizableImagePath(value: string): boolean;
export function getImageVariantRelativePath(publicRelativePath: string, width: number): string;
