import { Audio } from '@remotion/media';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { PING_SIZE_PX, type PingDemoProps } from './config';
import { PingMark } from './PingMark';
import { FPS, PING_DURATION_S, buildPlan } from './plan';
import { pingById, wheelFor } from './pings';
import { Wheel } from './Wheel';

const toFrame = (seconds: number): number => Math.round(seconds * FPS);

// Every ping plays its full sound; they overlap. Volume leaves headroom for the sum.
const SOUND_VOLUME = 0.5;

/** Transparent background: render with an alpha-capable format for OBS / editors. */
export function PingDemo(prop: PingDemoProps) {
  const { config } = prop;
  const frame = useCurrentFrame();
  const nowS = frame / FPS;
  const plan = buildPlan(config);
  const pingFrames = toFrame(PING_DURATION_S);

  // Wheels first, pings after, so every ping stays visible above the wheels
  const wheels = plan.steps.map((step, index) => {
    if (!config.showWheel) return null;
    const layout = wheelFor(step.pingId);
    return (
      <Wheel
        key={`wheel-${index}`}
        id={`w${index}`}
        x={step.x}
        y={step.y}
        t={nowS - step.openAtS}
        hoverAtS={step.hoverAtS - step.openAtS}
        releaseAtS={step.pingAtS - step.openAtS}
        hoverSlot={layout.hoverSlot}
        icons={layout.icons}
      />
    );
  });

  const pings = plan.steps.map((step, index) => {
    const pingT = nowS - step.pingAtS;
    const hasLanded = pingT >= 0;
    if (!hasLanded) return null;
    const def = pingById(step.pingId);
    return <PingMark key={`ping-${index}`} def={def} x={step.x} y={step.y} sizePx={PING_SIZE_PX} t={pingT} />;
  });

  const sounds = plan.steps.map((step, index) => {
    if (!config.sound) return null;
    const def = pingById(step.pingId);
    return (
      <Sequence key={`sound-${index}`} from={toFrame(step.pingAtS)} durationInFrames={pingFrames}>
        <Audio src={staticFile(`sounds/${def.sound}.wav`)} volume={SOUND_VOLUME} />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      {wheels}
      {pings}
      {sounds}
    </AbsoluteFill>
  );
}
