import esbuild from "esbuild"
import postcss from "esbuild-postcss"

/**
 * Environment variables
 */
const defineKeys = ["AVATAR_WEBKIT_AUTH_TOKEN"]
const defineDictionary = {}

for (let key of defineKeys) {
  if (!(key in process.env)) {
    throw new Error(`Missing environment variable "${key}"`)
  }
  defineDictionary[key] = `"${process.env[key]}"`
}

/**
 * Shared settings for esbuild
 *
 * @type {esbuild.BuildOptions}
 */
export const buildOptions = {
  entryPoints: ["src/room.js"],
  outdir: "dist",
  bundle: true,
  format: "esm",
  target: "esnext",
  plugins: [postcss()],
  define: defineDictionary,
  jsxFactory: "h",
  jsxFragment: "Fragment",
  inject: ["src/preact-shim.js"],
}
