// Trimmed from lolPing: src/shared/pings.ts

export type PingId =
  | 'danger' | 'push' | 'omw' | 'allin' | 'assist' | 'needvision' | 'missing' | 'enemyvision' | 'generic'
  | 'bait' | 'visioncleared' | 'missingflip';

export type PingDef = {
  id: PingId;
  /** Texture on the wheel slice: file in public/textures without ".png" */
  icon: string;
  /** Textures drawn at the ping location. Two entries = All In's clashing halves */
  art: string[];
  /** File in public/sounds without ".wav" */
  sound: string;
  /** Ring and glow colour */
  color: string;
};

export const ALL_PINGS: readonly PingDef[] = [
  { id: 'danger', icon: 'pingwheel_retreatrender', art: ['pingwheel_retreatrender'], sound: 'SRP_12', color: '#ff3b55' },
  { id: 'push', icon: 'pingwheel_pushrender', art: ['pingwheel_pushrender'], sound: 'SRP_9', color: '#35d27a' },
  { id: 'omw', icon: 'omw_cyan', art: ['omw_cyan'], sound: 'OnMyWay', color: '#2e8bff' },
  { id: 'allin', icon: 'png_all_in', art: ['pingwheel_allin_render_01', 'pingwheel_allin_render_02'], sound: 'SRP_4', color: '#f2b320' },
  { id: 'assist', icon: 'png_assist_me_128x128', art: ['png_assist_me_128x128'], sound: 'ComeHere', color: '#35d27a' },
  { id: 'needvision', icon: 'mt11_18_vision', art: ['mt11_18_vision'], sound: 'SRP_7', color: '#35d27a' },
  { id: 'missing', icon: 'png_enemymissing_128x128', art: ['png_enemymissing_128x128'], sound: 'MIA', color: '#f2c518' },
  { id: 'enemyvision', icon: 'pingwheel_enemyvisionrender', art: ['pingwheel_enemyvisionrender'], sound: 'AreaIsWarded', color: '#ff3b55' },
  { id: 'generic', icon: 'pingwheel_basicpingrender', art: ['pingwheel_basicpingrender'], sound: 'Base', color: '#2e8bff' },
  { id: 'bait', icon: 'pingwheel_baitrender', art: ['pingwheel_baitrender'], sound: 'SRP_11', color: '#efbc12' },
  { id: 'visioncleared', icon: 'pingwheel_visionclearedrender', art: ['pingwheel_visionclearedrender'], sound: 'SRP_6', color: '#2b80ff' },
  { id: 'missingflip', icon: 'enemy_missing_flipped', art: ['enemy_missing_flipped'], sound: 'MIA', color: '#f2c518' },
];

export const DEFAULT_WHEEL: readonly PingId[] = ['danger', 'push', 'omw', 'allin', 'assist', 'needvision', 'missing', 'enemyvision'];

/** The slice that gives way when a ping is not on the default wheel (lolPing lets users swap pings onto the wheel) */
const SWAP_SLOT = 6;

export const CENTER_ICON = 'pingwheel_basicpingrender';

export function pingById(id: PingId): PingDef {
  const found = ALL_PINGS.find((ping) => ping.id === id);
  if (!found) throw new Error(`Unknown ping ${id}`);
  return found;
}

export type WheelLayout = { icons: string[]; hoverSlot: number };

/** The wheel to draw for a ping: the default wheel, with the ping swapped in when it is not on it */
export function wheelFor(id: PingId): WheelLayout {
  const wheel = [...DEFAULT_WHEEL];
  const existingSlot = wheel.indexOf(id);
  const isOnWheel = existingSlot >= 0;
  const hoverSlot = isOnWheel ? existingSlot : SWAP_SLOT;
  wheel[hoverSlot] = id;
  const icons = wheel.map((wheelId) => pingById(wheelId).icon);
  return { icons, hoverSlot };
}
