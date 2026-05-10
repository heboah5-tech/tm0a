import { Link as WouterLink } from "wouter";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

export default function Link({ href, children, prefetch: _p, replace: _r, scroll: _s, ...rest }: Props) {
  if (/^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return <a href={href} {...rest}>{children}</a>;
  }
  return (
    <WouterLink href={href} {...(rest as any)}>
      {children}
    </WouterLink>
  );
}
