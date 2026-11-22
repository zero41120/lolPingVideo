import { serve } from "bun";
import { FFMPEG_FILES } from "../../ffmpeg-files";
import index from "./index.html";

// Dev server only. The production site is the static dist/ folder (bun run build).
const safeName = (name: string): boolean => !/[\\/]/.test(name) && name !== "." && name !== "..";

function assetRoute(folder: "textures" | "sounds", extension: string, type: string) {
  return async (req: Bun.BunRequest<`/${string}/:file`>) => {
    const { file } = req.params;
    const isValid = safeName(file) && file.endsWith(extension);
    if (!isValid) return new Response("Not found", { status: 404 });
    const asset = Bun.file(`public/${folder}/${file}`);
    const exists = await asset.exists();
    if (!exists) return new Response("Not found", { status: 404 });
    return new Response(asset, { headers: { "Content-Type": type } });
  };
}

async function serveFfmpegFile(req: Bun.BunRequest<"/ffmpeg/:file">) {
  const source = FFMPEG_FILES[req.params.file];
  if (!source) return new Response("Not found", { status: 404 });
  const type = source.endsWith(".wasm") ? "application/wasm" : "text/javascript";
  return new Response(Bun.file(source), { headers: { "Content-Type": type } });
}

const server = serve({
  routes: {
    "/ffmpeg/:file": serveFfmpegFile,
    "/textures/:file": assetRoute("textures", ".png", "image/png"),
    "/sounds/:file": assetRoute("sounds", ".wav", "audio/wav"),
    "/*": index,
  },
  development: { hmr: true, console: true },
});

console.log(`Server running at ${server.url}`);
