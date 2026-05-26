import { Link } from "react-router-dom";

export default function SettingsNavItem(props: {
  active: boolean;
  label: string;
  to: string;
}) {
  const base =
    "block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60";

  return (
    <Link
      to={props.to}
      className={
        props.active
          ? `${base} bg-emerald-500/12 text-emerald-200`
          : `${base} text-zinc-200 hover:bg-white/5 hover:text-white`
      }
    >
      {props.label}
    </Link>
  );
}

