import { defineConfig } from "@rslib/core";

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  mode: "production",
  lib: [
    {
      ...shared,
      format: "esm",
      output: {
        distPath: {
          root: "./dist/esm",
        },
      },
    },
    {
      ...shared,
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
