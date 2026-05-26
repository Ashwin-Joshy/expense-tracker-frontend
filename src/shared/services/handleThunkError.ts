import type { ApiError } from "./backendApi";
import { logout } from "../../features/auth/authSlice";

export function handleThunkError(
  e: unknown,
  dispatch: (action: unknown) => unknown,
): never {
  const err = e as ApiError;
  if (err.status === 401) dispatch(logout());
  throw e;
}
