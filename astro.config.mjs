import { defineConfig } from "astro/config";
import { remarkPlayground } from "./remark-playground";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkPlayground],
  },
  vite: {
    optimizeDeps: {
      exclude: ["@rollup/browser"],
      esbuildOptions: {
        target: "esnext",
      },
    },
    esbuild: {
      supported: {
        "top-level-await": true,
      },
    },
    build: {
      target: "esnext",
    },
  },
});
