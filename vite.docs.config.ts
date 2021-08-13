import reactPlugin from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import vitePluginLinaria from "vite-plugin-linaria";

const config = defineConfig({
  base: "",
  build: {
    outDir: "docs",
  },
  plugins: [reactPlugin(), vitePluginLinaria()],
});

export default config;
