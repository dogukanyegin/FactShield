import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // .env, .env.production vs okuyabilsin diye
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // GitHub Pages (Project Pages) için prod'da repo adı path'i şart
    base: mode === "production" ? "/factshield/" : "/",

    plugins: [react()],

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Genelde buna gerek yok; Vite zaten import.meta.env ile verir.
    // İlla custom define gerekiyorsa burada eklenir.
    define: {
      // örnek: __APP_ENV__: JSON.stringify(env.APP_ENV ?? mode),
    },
  };
});
