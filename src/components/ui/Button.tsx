"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

/**
 * Button — the single source of truth for actions.
 *
 * Variants: primary (gold CTA), secondary (green), ghost (outline).
 * Sizes: sm (32px) / md (40px) / lg (48px) — min 44px touch target on mobile via py.
 * States: hover, active, focus-visible (gold ring), disabled (50% + not-allowed), loading (spinner + aria-busy).
 *
 * Usage: <Button variant="primary" size="lg" loading={pending}>Enroll</Button>
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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow-sm",
        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
