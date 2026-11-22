import { FRAME_SIZES, type PingConfig, type SequenceItem } from './config';
import type { PingId } from './pings';

export const FPS = 60;

/** Values copied from lolPing: src/shared/settings.ts */
export const PING_DURATION_S = 3.2;

const FIRST_PING_S = 0.3;
const WHEEL_OPEN_BEFORE_PING_S = 0.1;
const HOVER_BEFORE_PING_S = 0.06;
const TAIL_S = 0.2;

export type PingStep = {
  pingId: PingId;
  x: number;
  y: number;
  openAtS: number;
  hoverAtS: number;
  pingAtS: number;
};

export type Plan = {
  width: number;
  height: number;
  steps: PingStep[];
  durationInFrames: number;
};

function buildStep(config: PingConfig, item: SequenceItem, pingAtS: number): PingStep {
  const { width, height } = FRAME_SIZES[config.shape];
  const openAtS = pingAtS - WHEEL_OPEN_BEFORE_PING_S;
  const hoverAtS = pingAtS - HOVER_BEFORE_PING_S;

  const x = width / 2 + item.dx;
  const y = height / 2 + item.dy;
  return { pingId: item.id, x, y, openAtS, hoverAtS, pingAtS };
}

export function buildPlan(config: PingConfig): Plan {
  const { width, height } = FRAME_SIZES[config.shape];
  const steps: PingStep[] = [];
  let pingAtS = FIRST_PING_S;
  config.pings.forEach((item) => {
    steps.push(buildStep(config, item, pingAtS));
    pingAtS += item.gapS; // each ping decides how long to wait before the next one
  });
  const hasSteps = steps.length > 0;
  const lastPingAtS = hasSteps ? steps[steps.length - 1].pingAtS : 0;
  const durationS = lastPingAtS + PING_DURATION_S + TAIL_S;
  const durationInFrames = Math.ceil(durationS * FPS);
  return { width, height, steps, durationInFrames };
}
