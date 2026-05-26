import { defineConfig } from "vite";
import path from "path";

// Note: some environments struggle when Vite tries to bundle native deps used by Tailwind.
// Loading plugins via dynamic import keeps the config loader from inlining `.node` bindings.
export default defineConfig(async () => {
  const [{ default: react }, { default: tailwindcss }] = await Promise.all([
    import("@vitejs/plugin-react"),
    import("@tailwindcss/vite"),
  ]);

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    build: {
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@app": path.resolve(__dirname, "./src/app"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@shared": path.resolve(__dirname, "./src/shared"),
      },
    },
  };
});
