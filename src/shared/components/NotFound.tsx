import { Link } from "react-router-dom";
import { Button } from "../../shared/components";

const NotFound = () => {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <div className="text-6xl font-black tracking-tight text-zinc-50">404</div>
      <p className="mt-3 text-sm text-zinc-400">Page not found.</p>
      <div className="mt-6">
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
