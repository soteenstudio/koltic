import esbuild from "esbuild";

const builds = [
  {
    entryPoints: ['./src/index.ts'],
    format: 'esm',
    outfile: 'dist/index.min.mjs',
  }
];

for (const config of builds) {
  esbuild.build({
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    ...config,
    external: ["chalk", "commander", "lightvm"],
  }).catch(() => process.exit(1))
}