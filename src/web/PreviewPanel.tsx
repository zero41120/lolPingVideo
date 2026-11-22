import { Player } from "@remotion/player";
import type { PingConfig, PingDemoProps } from "../config";
import { PingDemo } from "../PingDemo";
import { FPS, buildPlan } from "../plan";

type PreviewPanelProp = { config: PingConfig };

export function PreviewPanel(prop: PreviewPanelProp) {
  const { config } = prop;
  const plan = buildPlan(config);
  const inputProps: PingDemoProps = { config };
  const hasPings = plan.steps.length > 0;
  const aspectRatio = `${plan.width} / ${plan.height}`;


  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <div className="checkerboard max-h-full w-full max-w-[min(100%,calc((100svh-9rem)*var(--ratio)))] overflow-hidden rounded-lg border border-neutral-200" style={{ aspectRatio, ["--ratio" as string]: plan.width / plan.height }}>
        {hasPings && (
          <Player
            component={PingDemo}
            inputProps={inputProps}
            durationInFrames={plan.durationInFrames}
            fps={FPS}
            compositionWidth={plan.width}
            compositionHeight={plan.height}
            controls
            loop
            clickToPlay
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
