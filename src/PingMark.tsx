import { Easing, interpolate, staticFile } from 'remotion';
import { PING_DURATION_S } from './plan';
import type { PingDef } from './pings';

// Ported from lolPing: src/renderer/overlay/pingFx.ts + overlay.css (.ping)

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const textureUrl = (name: string): string => staticFile(`textures/${name}.png`);

/** CSS `pop`: .28s, 0.4 -> 1.15 -> 1 */
function popScale(t: number): number {
  const overshoot = Easing.bezier(0.2, 1.6, 0.4, 1);
  const grow = interpolate(t, [0, 0.168], [0.4, 1.15], { ...clamp, easing: overshoot });
  const settle = interpolate(t, [0.168, 0.28], [1.15, 1], { ...clamp, easing: overshoot });
  const isGrowing = t < 0.168;
  return isGrowing ? grow : settle;
}

function popOpacity(t: number): number {
  return interpolate(t, [0, 0.168], [0, 1], clamp);
}

/** CSS `bob`: 1.6s loop, 5px up and back, after a start delay */
function bobOffset(t: number, startS: number): number {
  const bobLoopS = 1.6;
  const bobT = t - startS;
  if (bobT < 0) return 0;
  const phase = (bobT % bobLoopS) / bobLoopS;
  const wave = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  return -5 * wave;
}

/** CSS `life`: full until 87% of the duration, then fades out */
function lifeOpacity(t: number): number {
  const fadeStartS = PING_DURATION_S * 0.87;
  return interpolate(t, [fadeStartS, PING_DURATION_S], [1, 0], clamp);
}

/** CSS `ground`: soft glow on the floor */
function groundOpacity(t: number): number {
  const d = PING_DURATION_S;
  return interpolate(t, [0, d * 0.1, d * 0.85, d], [0, 0.75, 0.55, 0], clamp);
}

type RingProp = { t: number; delayS: number; color: string; sizePx: number };

/** CSS `ring`: .65s expanding circle */
function Ring(prop: RingProp) {
  const localT = prop.t - prop.delayS;
  const isActive = localT >= 0 && localT <= 0.65;
  if (!isActive) return null;

  const ease = Easing.out(Easing.quad);
  const scale = interpolate(localT, [0, 0.65], [0.25, 1.35], { ...clamp, easing: ease });
  const opacity = interpolate(localT, [0, 0.65], [0.95, 0], { ...clamp, easing: ease });
  const ringSize = prop.sizePx * 1.09;

  return (
    <div
      style={{
        position: 'absolute',
        left: -ringSize / 2,
        top: -ringSize / 2,
        width: ringSize,
        height: ringSize,
        boxSizing: 'border-box',
        borderRadius: '50%',
        border: `3px solid ${prop.color}`,
        boxShadow: `0 0 18px ${prop.color}, inset 0 0 12px ${prop.color}`,
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
}

type ArtProp = { def: PingDef; t: number; sizePx: number };

/** One texture that pops in */
function PopArt(prop: ArtProp) {
  const { def, t, sizePx } = prop;
  const opacity = popOpacity(t);
  const transform = `translateY(${bobOffset(t, 0.3)}px) scale(${popScale(t)})`;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform }}>
      <img
        src={textureUrl(def.art[0])}
        style={{ width: sizePx, height: sizePx, filter: `drop-shadow(0 0 10px ${def.color})` }}
      />
    </div>
  );
}

/** CSS `shake`: .25s of small jolts after the halves meet */
function shakeOffset(t: number): { x: number; y: number } {
  const shakeStartS = 0.22;
  const shakeT = t - shakeStartS;
  const isShaking = shakeT >= 0 && shakeT <= 0.25;
  if (!isShaking) return { x: 0, y: 0 };
  const progress = shakeT / 0.25;
  const x = interpolate(progress, [0, 0.25, 0.5, 0.75, 1], [0, -3, 3, -2, 0]);
  const y = interpolate(progress, [0, 0.25, 0.5, 0.75, 1], [0, 2, -2, -1, 0]);
  return { x, y };
}

/** All In: two halves slide together, shake, and flash (CSS slide1, slide2, shake, flash) */
function ClashArt(prop: ArtProp) {
  const { def, t, sizePx } = prop;
  const slideEase = Easing.bezier(0.5, 0, 0.9, 0.5);
  const slideProgress = interpolate(t, [0, 0.22], [0, 1], { ...clamp, easing: slideEase });
  const slideOpacity = interpolate(t, [0, 0.22], [0, 1], clamp);
  const travelPx = sizePx * 0.64;
  const rightSlide = `translate(${travelPx * (1 - slideProgress)}px, ${-travelPx * (1 - slideProgress)}px)`;
  const leftSlide = `translate(${-travelPx * (1 - slideProgress)}px, ${-travelPx * (1 - slideProgress)}px)`;

  const shake = shakeOffset(t);
  const bob = bobOffset(t, 0.5);
  const clashTransform = `translate(${shake.x}px, ${shake.y + bob}px)`;

  const flashT = t - 0.2;
  const flashScale = interpolate(flashT, [0, 0.35], [0.3, 2.2], clamp);
  const flashOpacity = interpolate(flashT, [0, 0.105, 0.35], [0, 1, 0], clamp);
  const imageStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', filter: `drop-shadow(0 0 10px ${def.color})` } as const;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, transform: clashTransform }}>
        <img src={textureUrl(def.art[0])} style={{ ...imageStyle, transform: rightSlide, opacity: slideOpacity }} />
        <img src={textureUrl(def.art[1])} style={{ ...imageStyle, transform: leftSlide, opacity: slideOpacity }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '25%',
          top: '25%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: `radial-gradient(closest-side, #fff, ${def.color} 40%, transparent)`,
          opacity: flashOpacity,
          transform: `scale(${flashScale})`,
        }}
      />
    </div>
  );
}

type PingMarkProp = {
  def: PingDef;
  x: number;
  y: number;
  sizePx: number;
  /** Seconds since the ping landed */
  t: number;
};

export function PingMark(prop: PingMarkProp) {
  const { def, x, y, sizePx, t } = prop;
  const isOver = t > PING_DURATION_S;
  if (isOver) return null;

  const isClash = def.art.length === 2;
  const groundWidth = sizePx * 0.84;
  const groundHeight = sizePx * 0.24;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: 'absolute',
          left: -sizePx * 0.42,
          top: sizePx * 0.2,
          width: groundWidth,
          height: groundHeight,
          borderRadius: '50%',
          background: `radial-gradient(closest-side, ${def.color}, transparent)`,
          opacity: groundOpacity(t),
        }}
      />
      <Ring t={t} delayS={0} color={def.color} sizePx={sizePx} />
      <Ring t={t} delayS={0.22} color={def.color} sizePx={sizePx} />
      <Ring t={t} delayS={1.4} color={def.color} sizePx={sizePx} />
      <div
        style={{
          position: 'absolute',
          left: -sizePx * 0.5,
          top: -sizePx * 0.73,
          width: sizePx,
          height: sizePx,
          opacity: lifeOpacity(t),
        }}
      >
        {isClash ? <ClashArt def={def} t={t} sizePx={sizePx} /> : <PopArt def={def} t={t} sizePx={sizePx} />}
      </div>
    </div>
  );
}
