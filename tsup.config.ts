import { defineConfig } from 'tsup';

export default defineConfig({
    tsconfig: './tsconfig.json',
    entry: ['src/app.ts'],
    format: ['esm'],
    dts: true,
    minify: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
});
