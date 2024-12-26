import { defineConfig } from "@rslib/core";

export default defineConfig({
  mode: "production",
  lib: [
    {
      dts: {
        bundle: false,
      },
      format: "esm",
      output: {
        distPath: {
          root: "./dist/esm",
        },
      },
    },
    {
      dts: {
        bundle: false,
      },
      format: "cjs",
      output: {
        distPath: {
          root: "./dist/cjs",
        },
      },
    },
  ],
  output: {
    target: "web",
  },
});
