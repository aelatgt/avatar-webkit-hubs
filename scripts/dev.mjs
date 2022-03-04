import esbuild from "esbuild"
import { buildOptions } from "../esbuild.config.mjs"

/** @type {esbuild.ServeOptions} */
const serveOptions = {
  port: 3000,
  onRequest: (args) => {
    console.log(`[${args.status}] ${args.method} ${args.path}: completed in ${args.timeInMS} ms`)
  },
}

const serveResult = await esbuild.serve(serveOptions, {
  ...buildOptions,
})

console.log(`Server running on http://${serveResult.host}:${serveResult.port}`)
