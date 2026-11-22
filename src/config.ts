import { random } from 'remotion';
import type { PingId } from './pings';

export type FrameShape = 'square' | 'wide';

export const FRAME_SIZES: Record<FrameShape, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  wide: { width: 1920, height: 1080 },
};

/**
 * One ping in the sequence.
 * gapS: how long to wait after it before the next one fires.
 * dx, dy: where it lands, in pixels from the center of the frame.
 */
export type SequenceItem = { key: string; id: PingId; gapS: number; dx: number; dy: number };

export const DEFAULT_GAP_S = 0.25;
/** How far from the center a random position can be */
export const RANDOM_OFFSET_PX = 200;
export const PING_SIZE_PX = 110;

export type Offset = { dx: number; dy: number };

/** A random spot within rangePx of the center */
export function randomOffset(rangePx: number): Offset {
  const dx = Math.round((Math.random() * 2 - 1) * rangePx);
  const dy = Math.round((Math.random() * 2 - 1) * rangePx);
  return { dx, dy };
}

export function newItem(id: PingId): SequenceItem {
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { key, id, gapS: DEFAULT_GAP_S, ...randomOffset(RANDOM_OFFSET_PX) };
}

/** Same every time, so the CLI render and the first page load match */
function defaultItem(index: number): SequenceItem {
  const dx = Math.round((random(`default-dx-${index}`) * 2 - 1) * RANDOM_OFFSET_PX);
  const dy = Math.round((random(`default-dy-${index}`) * 2 - 1) * RANDOM_OFFSET_PX);
  return { key: `default-${index}`, id: 'missing', gapS: DEFAULT_GAP_S, dx, dy };
}

export type PingConfig = {
  /** Pings in the order they are played */
  pings: SequenceItem[];
  showWheel: boolean;
  sound: boolean;
  shape: FrameShape;
};

export const DEFAULT_CONFIG: PingConfig = {
  pings: Array.from({ length: 6 }, (_, index) => defaultItem(index)),
  showWheel: true,
  sound: true,
  shape: 'square',
};

/** Props of the Remotion composition. A type alias, so it fits Remotion's Record<string, unknown> */
export type PingDemoProps = { config: PingConfig };
