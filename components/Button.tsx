import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const variantClass = variant === "secondary" ? "button button--secondary" : "button";

  return (
    <button className={`${variantClass} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}
