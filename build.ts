import tailwind from "bun-plugin-tailwind";
import { FFMPEG_FILES } from "./ffmpeg-files";

const result = await Bun.build({
  entrypoints: ["./src/web/index.html"],
  outdir: "dist",
  publicPath: "./",
  target: "browser",
  sourcemap: "linked",
  minify: true,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  plugins: [tailwind],
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}

for (const path of new Bun.Glob("public/**/*").scanSync(".")) {
  const target = path.replace(/^public\//, "dist/");
  await Bun.write(target, Bun.file(path));
}

for (const [name, source] of Object.entries(FFMPEG_FILES)) {
  await Bun.write(`dist/ffmpeg/${name}`, Bun.file(source));
}
