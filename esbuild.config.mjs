import postcss from "esbuild-postcss"

/** @type {import('esbuild').BuildOptions} */
export const buildOptions = {
  entryPoints: ["src/room.js"],
  outdir: "dist",
  bundle: true,
  format: "esm",
  target: "esnext",
  plugins: [postcss()],
  jsxFactory: "h",
  jsxFragment: "Fragment",
  inject: ["src/preact-shim.js"],
}
