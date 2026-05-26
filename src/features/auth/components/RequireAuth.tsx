import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";

export default function RequireAuth({ children }: PropsWithChildren) {
  const token = useAppSelector((s) => s.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
