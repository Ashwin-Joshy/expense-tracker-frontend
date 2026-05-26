import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: boolean;
};

export default function Card({ children, className = "", padding = true }: Props) {
  return (
    <div
      className={`rounded-xl border border-emerald-900/30 bg-zinc-950/40 ${padding ? "p-4" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
