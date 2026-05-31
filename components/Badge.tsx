import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "neutral" | "role" | "status";
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  const variantClass = variant === "neutral" ? "badge" : `badge badge--${variant}`;

  return <span className={variantClass}>{children}</span>;
}
