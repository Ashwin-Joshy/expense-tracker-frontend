import type { SelectHTMLAttributes } from "react";

type Props = {
  label: string;
  error?: string;
  options: readonly { value: string; label: string }[] | readonly string[];
  placeholder?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectField({
  label,
  error,
  options,
  placeholder,
  className = "",
  id,
  ...rest
}: Props) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${fieldId}-error`;

  return (
    <label className="space-y-2" htmlFor={fieldId}>
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      <select
        id={fieldId}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${className}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ),
        )}
      </select>
      {error ? (
        <div id={errorId} role="alert" className="text-xs text-rose-300">
          {error}
        </div>
      ) : null}
    </label>
  );
}
