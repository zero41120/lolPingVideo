import { Config } from '@remotion/cli/config';

// Transparent output for OBS: PNG frames + VP8 with an alpha channel (.webm)
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuva420p');
Config.setCodec('vp8');
Config.setOverwriteOutput(true);
