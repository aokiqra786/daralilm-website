import type { HTMLAttributes } from "react";

/**
 * Card — surface container for programs, fund areas, faculty, forms.
 * White by default (or parchment), rounded, soft shadow, optional gold top-rule.
 *
 * Usage: <Card goldRule><h3>…</h3></Card>
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  goldRule?: boolean;
  surface?: "white" | "parchment";
}

export function Card({ goldRule = false, surface = "white", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        surface === "parchment" ? "bg-parchment" : "bg-white",
        "rounded-2xl border border-line shadow-sm p-6",
        goldRule ? "border-t-4 border-t-gold" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
