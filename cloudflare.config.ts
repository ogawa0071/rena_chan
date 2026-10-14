import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "rena_chan",
    compatibilityDate: "2026-10-12",
    entrypoint,
    env: {
      CHANNEL_ACCESS_TOKEN: bindings.secret(),
      CHANNEL_SECRET: bindings.secret(),
    },
  },
});
