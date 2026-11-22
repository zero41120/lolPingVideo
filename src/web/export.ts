import { canRenderMediaOnWeb, renderMediaOnWeb, renderStillOnWeb } from '@remotion/web-renderer';
import type { PingConfig, PingDemoProps } from '../config';
import { PingDemo } from '../PingDemo';
import { FPS, buildPlan } from '../plan';

// Everything here runs in the browser: Remotion's web renderer (WebCodecs) draws the same
// composition the preview plays, so the exported file matches what you see.

export type ProgressCallback = (fraction: number) => void;

export class UnsupportedError extends Error {}

function buildComposition(config: PingConfig) {
  const plan = buildPlan(config);
  const inputProps: PingDemoProps = { config };
  const composition = {
    id: 'PingDemo',
    component: PingDemo,
    width: plan.width,
    height: plan.height,
    fps: FPS,
    durationInFrames: plan.durationInFrames,
    defaultProps: inputProps,
  };
  return { composition, inputProps, plan };
}

/** vp9 first, vp8 as the fallback: whichever this browser can encode with an alpha channel */
async function pickAlphaCodec(width: number, height: number): Promise<'vp9' | 'vp8'> {
  const codecs = ['vp9', 'vp8'] as const;
  for (const videoCodec of codecs) {
    const result = await canRenderMediaOnWeb({ container: 'webm', videoCodec, transparent: true, width, height });
    if (result.canRender) return videoCodec;
  }
  throw new UnsupportedError('transparent webm');
}

export async function exportWebm(config: PingConfig, onProgress: ProgressCallback, signal: AbortSignal): Promise<Blob> {
  const { composition, inputProps, plan } = buildComposition(config);
  const videoCodec = await pickAlphaCodec(plan.width, plan.height);
  const result = await renderMediaOnWeb({
    composition,
    inputProps,
    container: 'webm',
    videoCodec,
    transparent: true,
    muted: !config.sound,
    signal,
    onProgress: (progress) => onProgress(progress.progress),
  });
  return result.getBlob();
}

async function exportWav(config: PingConfig, onProgress: ProgressCallback, signal: AbortSignal): Promise<Blob> {
  const { composition, inputProps } = buildComposition(config);
  const result = await renderMediaOnWeb({
    composition,
    inputProps,
    container: 'wav',
    signal,
    onProgress: (progress) => onProgress(progress.progress),
  });
  return result.getBlob();
}

const frameName = (frame: number): string => `frame_${String(frame).padStart(5, '0')}.png`;

// ---------- ProRes 4444 (.mov), the same format as `bun run render:prores` ----------
// The browser has no ProRes encoder, so ffmpeg.wasm (loaded only when this export runs) encodes
// the frames and audio that the web renderer produced.

const FRAME_SHARE = 0.4; // progress: 40% rendering frames, 60% encoding

function ffmpegUrl(name: string): string {
  const base = new URL(".", document.baseURI).href;
  return `${base}ffmpeg/${name}`;
}

export async function exportProres(config: PingConfig, onProgress: ProgressCallback, signal: AbortSignal): Promise<Blob> {
  const { composition, inputProps, plan } = buildComposition(config);
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();
  const stop = () => ffmpeg.terminate();
  signal.addEventListener("abort", stop);

  try {
    await ffmpeg.load({
      classWorkerURL: ffmpegUrl("worker.js"),
      coreURL: ffmpegUrl("ffmpeg-core.js"),
      wasmURL: ffmpegUrl("ffmpeg-core.wasm"),
    });

    // 1. Frames go straight into ffmpeg's in-memory disk, one transparent PNG each
    for (let frame = 0; frame < plan.durationInFrames; frame++) {
      signal.throwIfAborted();
      const still = await renderStillOnWeb({ composition, inputProps, frame, transparent: true, signal });
      const png = await still.blob({ format: "png" });
      const bytes = new Uint8Array(await png.arrayBuffer());
      await ffmpeg.writeFile(frameName(frame), bytes);
      onProgress(((frame + 1) / plan.durationInFrames) * FRAME_SHARE);
    }

    // 2. The sound track, when sound is on
    const hasAudio = config.sound;
    if (hasAudio) {
      const wav = await exportWav(config, () => {}, signal);
      await ffmpeg.writeFile("audio.wav", new Uint8Array(await wav.arrayBuffer()));
    }

    // 3. Encode: ProRes 4444 with alpha
    ffmpeg.on("progress", ({ progress }) => {
      const clamped = Math.min(1, Math.max(0, progress));
      onProgress(FRAME_SHARE + clamped * (1 - FRAME_SHARE));
    });
    const videoInput = ["-framerate", String(FPS), "-i", "frame_%05d.png"];
    const audioInput = hasAudio ? ["-i", "audio.wav"] : [];
    const videoCodec = ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-vendor", "apl0"];
    const audioCodec = hasAudio ? ["-c:a", "pcm_s16le"] : [];
    const exitCode = await ffmpeg.exec([...videoInput, ...audioInput, ...videoCodec, ...audioCodec, "out.mov"]);
    if (exitCode !== 0) throw new Error(`ffmpeg exited with ${exitCode}`);

    const data = await ffmpeg.readFile("out.mov");
    return new Blob([data as BlobPart], { type: "video/quicktime" });
  } finally {
    signal.removeEventListener("abort", stop);
    ffmpeg.terminate();
  }
}
