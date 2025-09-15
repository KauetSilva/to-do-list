import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolver problemas de compatibilidade com date-fns
      "date-fns": "date-fns/esm",
    },
  },
  optimizeDeps: {
    include: ["date-fns", "date-fns/locale"],
  },
  ssr: {
    // Resolver problemas de SSR com dependências
    noExternal: ["date-fns"],
  },
});
