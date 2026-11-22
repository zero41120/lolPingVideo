import { Composition, type CalculateMetadataFunction } from 'remotion';
import { DEFAULT_CONFIG, type PingDemoProps } from './config';
import { PingDemo } from './PingDemo';
import { FPS, buildPlan } from './plan';

// Used by the Remotion CLI (bun run render). The website builds its own composition from the same pieces.
const calculateMetadata: CalculateMetadataFunction<PingDemoProps> = ({ props }) => {
  const plan = buildPlan(props.config);
  return { width: plan.width, height: plan.height, durationInFrames: plan.durationInFrames };
};

export function Root() {
  const plan = buildPlan(DEFAULT_CONFIG);
  return (
    <Composition
      id="PingDemo"
      component={PingDemo}
      durationInFrames={plan.durationInFrames}
      fps={FPS}
      width={plan.width}
      height={plan.height}
      defaultProps={{ config: DEFAULT_CONFIG }}
      calculateMetadata={calculateMetadata}
    />
  );
}
