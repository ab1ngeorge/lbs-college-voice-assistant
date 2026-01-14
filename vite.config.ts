import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers for smaller, faster code
    target: "esnext",
    // Use esbuild for fast minification
    minify: "esbuild",
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor dependencies for better caching
          if (id.includes("node_modules")) {
            // React ecosystem - changes rarely
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
              return "vendor-react";
            }
            // Supabase client
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            // Radix UI components
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // React Query
            if (id.includes("@tanstack")) {
              return "vendor-query";
            }
            // Lucide icons
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 300,
    // CSS code splitting
    cssCodeSplit: true,
  },
}));
