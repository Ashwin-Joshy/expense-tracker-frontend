import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <div className="text-6xl font-black tracking-tight text-zinc-50">404</div>
      <p className="mt-3 text-sm text-zinc-400">Page not found.</p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
