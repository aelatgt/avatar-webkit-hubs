import esbuild from "esbuild"
import { buildOptions } from "../esbuild.config.mjs"

/** @type {esbuild.ServeOptions} */
const serveOptions = {
  port: 3000,
}

const serveResult = await esbuild.serve(serveOptions, {
  ...buildOptions,
})

console.log(`Server running on http://${serveResult.host}:${serveResult.port}`)
