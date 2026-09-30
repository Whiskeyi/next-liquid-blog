import type { CSSProperties, ImgHTMLAttributes, Ref } from "react";
import { getResponsiveImageProps } from "@/lib/image-variants";

type ResponsiveImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  sourceWidth?: number;
  fill?: boolean;
  ref?: Ref<HTMLImageElement>;
};

const fillStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%"
};

export function ResponsiveImage({ src, sourceWidth, fill = false, style, ...props }: ResponsiveImageProps) {
  const source = getResponsiveImageProps(src, sourceWidth);

  return (
    // Static export uses build-time WebP variants and keeps the original as a fallback.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} {...source} style={fill ? { ...fillStyle, ...style } : style} />
  );
}
