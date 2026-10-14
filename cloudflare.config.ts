import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "renachan",
    compatibilityDate: "2026-10-12",
    entrypoint,
    env: {
      CHANNEL_ACCESS_TOKEN: bindings.secret(),
      CHANNEL_SECRET: bindings.secret(),
    },
    observability: {
      enabled: true,
    },
    workersDev: true,
    previewUrls: true,
  },
});
