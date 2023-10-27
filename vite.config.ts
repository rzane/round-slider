import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: "./src/round-slider.ts",
      name: "RoundSlider",
      fileName: "round-slider",
    },
  },
});
