import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { backendApi, type ApiError, type AuthUser } from "../../shared/services/backendApi";
import { clearAuthToken, getAuthToken, setAuthToken } from "../../shared/services/authToken";

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "error";
  errorMessage: string | null;
};

const initialState: AuthState = {
  token: getAuthToken(),
  user: null,
  status: "idle",
  errorMessage: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (input: { email: string; password: string }, api) => {
    try {
      const res = await backendApi.auth.login(input);
      setAuthToken(res.accessToken);
      return res;
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) clearAuthToken();
      return api.rejectWithValue(err.message);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (input: { email: string; password: string; userName?: string }, api) => {
    try {
      const res = await backendApi.auth.register(input);
      setAuthToken(res.accessToken);
      return res;
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) clearAuthToken();
      return api.rejectWithValue(err.message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  clearAuthToken();
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.status = "loading";
      state.errorMessage = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.status = "idle";
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status = "error";
      state.errorMessage =
        typeof action.payload === "string" ? action.payload : "Login failed";
    });

    builder.addCase(register.pending, (state) => {
      state.status = "loading";
      state.errorMessage = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.status = "idle";
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.status = "error";
      state.errorMessage =
        typeof action.payload === "string"
          ? action.payload
          : "Registration failed";
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.errorMessage = null;
    });
  },
});

export default authSlice.reducer;
