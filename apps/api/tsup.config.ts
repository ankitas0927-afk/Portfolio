import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/scripts/seed.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  clean: true,
  noExternal: [
    "@ankita-portfolio/config",
    "@ankita-portfolio/shared-types",
    "@ankita-portfolio/validation"
  ]
});
