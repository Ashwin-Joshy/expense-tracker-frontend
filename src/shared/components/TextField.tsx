import type { InputHTMLAttributes } from "react";

type Props = {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function TextField({ label, error, className = "", id, ...rest }: Props) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${fieldId}-error`;

  return (
    <label className="space-y-2" htmlFor={fieldId}>
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      <input
        id={fieldId}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${className}`}
        {...rest}
      />
      {error ? (
        <div id={errorId} role="alert" className="text-xs text-rose-300">
          {error}
        </div>
      ) : null}
    </label>
  );
}
