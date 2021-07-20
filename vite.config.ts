import reactPlugin from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import * as packageJson from "./package.json";

const config = defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "react-fukidashi",
    },
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.dependencies),
        ...Object.keys(packageJson.peerDependencies),
      ],
    },
  },
  plugins: [reactPlugin()],
});

export default config;
