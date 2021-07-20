import reactPlugin from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import linariaPlugin from "vite-plugin-linaria";
import * as packageJson from "./package.json";

const config = defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "react-fukidashi",
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    },
  },
  plugins: [reactPlugin(), linariaPlugin()],
});

export default config;
