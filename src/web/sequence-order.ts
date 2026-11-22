import type { DropEdge } from "./DropDivider";

// Same behavior as Shizuru Schedule Maker's art-layer-order.ts

/** The key order after dragging activeKey onto overKey, or null when either is missing */
export function moveKey(keys: string[], activeKey: string, overKey: string): string[] | null {
  const from = keys.indexOf(activeKey);
  const to = keys.indexOf(overKey);
  if (from < 0 || to < 0) return null;
  const withoutActive = keys.filter((key) => key !== activeKey);
  withoutActive.splice(to, 0, activeKey);
  return withoutActive;
}

/** Dragging down lands below the target row, dragging up lands above it */
export function dropEdgeFor(keys: string[], rowKey: string, activeKey: string | null, overKey: string | null): DropEdge | undefined {
  const isTarget = rowKey === overKey && overKey !== activeKey;
  if (!isTarget || !activeKey) return undefined;
  const movingDown = keys.indexOf(activeKey) < keys.indexOf(rowKey);
  return movingDown ? "bottom" : "top";
}
