import esbuild from "esbuild"
import { buildOptions } from "../esbuild.config.mjs"

const result = await esbuild.build({
  ...buildOptions,
  minify: true,
  metafile: true,
})

console.log(await esbuild.analyzeMetafile(result.metafile))
