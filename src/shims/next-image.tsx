import type { ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string | { src: string };
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  loader?: any;
  sizes?: string;
};

export default function Image({ src, alt, width, height, fill, priority: _p, quality: _q, unoptimized: _u, placeholder: _pl, blurDataURL: _b, loader: _l, style, ...rest }: Props) {
  const finalSrc = typeof src === "string" ? src : src.src;
  const finalStyle = fill
    ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const, ...style }
    : style;
  return <img src={finalSrc} alt={alt} width={width as any} height={height as any} style={finalStyle} {...rest} />;
}
