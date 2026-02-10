import esbuild from "esbuild";

const builds = [
  {
    entryPoints: ['./src/index.ts'],
    format: 'esm',
    outfile: 'dist/index.min.mjs',
  },
  {
    entryPoints: ['./src/index.ts'],
    format: 'cjs',
    outfile: 'dist/index.min.cjs',
  },
  {
    entryPoints: ['./src/vm/index.ts'],
    format: 'esm',
    outfile: 'dist/vm.min.mjs',
  }
];

for (const config of builds) {
  esbuild.build({
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    ...config,
    external: ["chalk", "commander", "wabt"],
  }).catch(() => process.exit(1))
}