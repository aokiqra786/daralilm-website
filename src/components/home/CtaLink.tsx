import Link from "next/link";
import type { ReactNode } from "react";

/**
 * CtaLink — a navigation CTA styled to match the ui/Button component.
 *
 * Button in ui/ renders a real <button> (for actions); homepage CTAs need to
 * navigate, so this mirrors Button's variant/size classes on a Next <Link>.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-gold text-navy hover:bg-gold-deep hover:text-white",
  secondary: "bg-green text-white hover:bg-green-700",
  ghost: "bg-transparent text-green border border-green hover:bg-green hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 min-h-[32px]",
  md: "text-base px-5 py-2.5 min-h-[40px]",
  lg: "text-lg px-7 py-3 min-h-[48px]",
};

export function CtaLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow-sm",
        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
