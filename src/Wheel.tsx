import { interpolate, staticFile } from 'remotion';
import { CENTER_ICON } from './pings';

// Ported from lolPing: src/renderer/overlay/wheel.ts (build) + overlay.css
// Fades and hover ramps are shorter than the app's (.12s / .1s) for rapid fire.
const WHEEL_SIZE = 600;
const WHEEL = { innerR: 86, outerR: 188, extR: 288, iconR: 137, iconSize: 48 };
const SLOTS = 8;
const SLICE_DEG = 45;
const FADE_S = 0.04;
const HOVER_RAMP_S = 0.03;

const IDLE_FILTER = 'grayscale(1) sepia(.75) saturate(1.3) brightness(1.15)';
const SANS = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

function polar(radius: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [radius * Math.cos(rad), radius * Math.sin(rad)];
}

function sector(r0: number, r1: number, a0: number, a1: number): string {
  const [x0, y0] = polar(r0, a0);
  const [x1, y1] = polar(r1, a0);
  const [x2, y2] = polar(r1, a1);
  const [x3, y3] = polar(r0, a1);
  return `M${x0},${y0} L${x1},${y1} A${r1},${r1} 0 0 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0 0 ${x0},${y0}Z`;
}

const sliceMid = (slot: number): number => -90 + slot * SLICE_DEG;
const isCardinal = (slot: number): boolean => slot % 2 === 0;

type WheelProp = {
  x: number;
  y: number;
  /** Seconds since the wheel opened */
  t: number;
  hoverAtS: number;
  releaseAtS: number;
  hoverSlot: number;
  /** Texture names for the 8 slices, top (N) then clockwise */
  icons: string[];
  /** Unique per wheel: keeps gradient ids apart */
  id: string;
};

/** Opacity + scale(.85 -> 1) on open; the reverse on release */
function wheelPresence(prop: WheelProp): number {
  const opening = interpolate(prop.t, [0, FADE_S], [0, 1], clamp);
  const closing = interpolate(prop.t, [prop.releaseAtS, prop.releaseAtS + FADE_S], [1, 0], clamp);
  return Math.min(opening, closing);
}

export function Wheel(prop: WheelProp) {
  const { x, y, t, hoverAtS, releaseAtS, hoverSlot, icons, id } = prop;
  const presence = wheelPresence(prop);
  const isVisible = presence > 0;
  if (!isVisible) return null;

  const { innerR, outerR, extR, iconR, iconSize } = WHEEL;
  const gid = `lp-${id}`;
  const isHovering = t >= hoverAtS && t < releaseAtS;
  const hoverProgress = interpolate(t, [hoverAtS, hoverAtS + HOVER_RAMP_S], [0, 1], clamp);
  const wedgeOpacity = 0.55 * hoverProgress;
  const slots = [...Array(SLOTS).keys()];

  return (
    <svg
      viewBox="-300 -300 600 600"
      width={WHEEL_SIZE}
      height={WHEEL_SIZE}
      style={{
        position: 'absolute',
        left: x - WHEEL_SIZE / 2,
        top: y - WHEEL_SIZE / 2,
        opacity: presence,
        transform: `scale(${0.85 + 0.15 * presence})`,
      }}
    >
      <defs>
        <radialGradient id={`${gid}-ext`} cx="0" cy="0" r={extR} gradientUnits="userSpaceOnUse">
          <stop offset={outerR / extR} stopColor="#5c6066" stopOpacity=".55" />
          <stop offset="1" stopColor="#5c6066" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-ring`} cx="0" cy="0" r={outerR} gradientUnits="userSpaceOnUse">
          <stop offset={innerR / outerR} stopColor="#2a2d31" />
          <stop offset="1" stopColor="#4a4e54" />
        </radialGradient>
        <radialGradient id={`${gid}-hot`} cx="0" cy="0" r={extR} gradientUnits="userSpaceOnUse">
          <stop offset={innerR / extR} stopColor="#8a8f96" />
          <stop offset={outerR / extR} stopColor="#9aa0a8" />
          <stop offset="1" stopColor="#9aa0a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-core`} cx="0" cy="-10" r={innerR} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2c5d60" />
          <stop offset="1" stopColor="#11292c" />
        </radialGradient>
      </defs>

      {slots.filter(isCardinal).map((slot) => (
        <path
          key={`ext-${slot}`}
          d={sector(outerR, extR, sliceMid(slot) - 22.5, sliceMid(slot) + 22.5)}
          fill={`url(#${gid}-ext)`}
        />
      ))}

      <circle
        r={(innerR + outerR) / 2}
        fill="none"
        stroke={`url(#${gid}-ring)`}
        strokeWidth={outerR - innerR}
        opacity={0.92}
      />

      {slots.map((slot) => {
        const reach = isCardinal(slot) ? extR : outerR;
        const isHot = isHovering && slot === hoverSlot;
        const [lx0, ly0] = polar(innerR, sliceMid(slot) - 22.5);
        const [lx1, ly1] = polar(outerR, sliceMid(slot) - 22.5);
        return (
          <g key={`wedge-${slot}`}>
            <path
              d={sector(innerR, reach, sliceMid(slot) - 22.5, sliceMid(slot) + 22.5)}
              fill={`url(#${gid}-hot)`}
              fillOpacity={isHot ? wedgeOpacity : 0}
            />
            <line x1={lx0} y1={ly0} x2={lx1} y2={ly1} stroke="#a08a5c" strokeOpacity={0.45} strokeWidth={1.2} />
          </g>
        );
      })}

      {slots.map((slot) => {
        const [ix, iy] = polar(iconR, sliceMid(slot));
        const isHot = isHovering && slot === hoverSlot;
        const scale = isHot ? 1 + 0.18 * hoverProgress : 1;
        const filter = isHot ? 'none' : IDLE_FILTER;
        return (
          <image
            key={`icon-${slot}`}
            href={staticFile(`textures/${icons[slot]}.png`)}
            x={ix - iconSize / 2}
            y={iy - iconSize / 2}
            width={iconSize}
            height={iconSize}
            style={{ filter, transform: `scale(${scale})`, transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        );
      })}

      <circle r={innerR + 4} fill="none" stroke="#1a1a1a" strokeWidth={6} opacity={0.6} />
      <circle r={innerR} fill={`url(#${gid}-core)`} stroke="#c8aa6e" strokeWidth={3} />
      <circle r={innerR - 7} fill="none" stroke="#8a7448" strokeWidth={1} opacity={0.6} />
      <image href={staticFile(`textures/${CENTER_ICON}.png`)} x={-20} y={-58} width={40} height={40} />
      <text x={0} y={6} textAnchor="middle" style={{ font: `600 15px ${SANS}`, letterSpacing: 1, fill: '#1fa9e0' }}>
        PING
      </text>
      <text x={6} y={50} textAnchor="middle" style={{ font: `600 9px ${SANS}`, letterSpacing: 0.5, fill: '#6c7a7c' }}>
        BACK
      </text>
      <g opacity={0.55} transform="translate(-26,40)">
        <rect x={0} y={0} width={11} height={16} rx={5.5} fill="none" stroke="#6c7a7c" strokeWidth={1.3} />
        <path d="M5.5,0 V7 H11 V5.5 A5.5,5.5 0 0 0 5.5,0Z" fill="#6c7a7c" />
      </g>
    </svg>
  );
}
