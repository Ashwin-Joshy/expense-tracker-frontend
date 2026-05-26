import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const variantClass: Record<Variant, string> = {
  primary:
    "rounded-md border border-emerald-500/25 bg-emerald-500/12 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200",
  secondary:
    "rounded-md border border-white/10 bg-white/5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white",
  ghost:
    "text-sm text-zinc-500 hover:text-zinc-300",
};

const sizeClass: Record<Size, string> = {
  sm: "rounded px-2 py-1 text-xs",
  md: "rounded-md px-3 py-2",
};

type Props = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`${variantClass[variant]} ${sizeClass[size]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
