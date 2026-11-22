// ffmpeg.wasm files the site loads on demand (for the ProRes export), served at /ffmpeg/<name>.
// Source paths are inside node_modules, so a version bump needs no copy step.
const LIB = "node_modules/@ffmpeg/ffmpeg/dist/esm";
const CORE = "node_modules/@ffmpeg/core/dist/esm";

export const FFMPEG_FILES: Record<string, string> = {
  "worker.js": `${LIB}/worker.js`,
  "const.js": `${LIB}/const.js`,
  "errors.js": `${LIB}/errors.js`,
  "ffmpeg-core.js": `${CORE}/ffmpeg-core.js`,
  "ffmpeg-core.wasm": `${CORE}/ffmpeg-core.wasm`,
};
