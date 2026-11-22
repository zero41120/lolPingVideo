import { useCallback } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

// Copied from Shizuru Schedule Maker. Each row is both draggable and a drop target. The row stays in place while dragging;
// a drag overlay follows the pointer, so the scrolling list never grows.
export function useRowDrag(id: string) {
  const draggable = useDraggable({ id });
  const droppable = useDroppable({ id });
  const setDragRef = draggable.setNodeRef;
  const setDropRef = droppable.setNodeRef;
  const setNodeRef = useCallback((node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  }, [setDragRef, setDropRef]);
  return {
    setNodeRef,
    isDragging: draggable.isDragging,
    setActivatorNodeRef: draggable.setActivatorNodeRef,
    attributes: draggable.attributes,
    listeners: draggable.listeners,
  };
}
