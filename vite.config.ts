import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large dependencies into their own bundles
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-icons": ["lucide-react"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-popover", "@radix-ui/react-select"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-date": ["date-fns", "react-day-picker"],
          "vendor-resizable": ["react-resizable-panels"],
          "vendor-chart": ["recharts"],
          "vendor-router": ["react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minify with esbuild
    minify: "esbuild",
    // Source maps for production debugging
    sourcemap: false,
  },
}));
