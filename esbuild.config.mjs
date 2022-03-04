import esbuild from "esbuild"
import postcss from "esbuild-postcss"
import dotenv from "dotenv"

const env = dotenv.config({ path: ".env.local" })
const defineStrings = Object.fromEntries(Object.entries(env.parsed).map(([key, value]) => [key, `\"${value}\"`]))

/** @type {esbuild.BuildOptions} */
export const buildOptions = {
  entryPoints: ["src/room.js"],
  outdir: "dist",
  bundle: true,
  format: "esm",
  target: "esnext",
  plugins: [postcss()],
  define: defineStrings,
  jsxFactory: "h",
  jsxFragment: "Fragment",
  inject: ["src/preact-shim.js"],
}
