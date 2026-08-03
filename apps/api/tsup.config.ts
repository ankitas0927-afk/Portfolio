import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/scripts/seed.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'node22',
  outDir: 'dist',
  dts: false,
  treeshake: true,
});
