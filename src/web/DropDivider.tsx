import { cn } from "../lib/utils";

export type DropEdge = "top" | "bottom";

type DropDividerProp = { edge?: DropEdge };

// Sits in the gap between rows, where the dragged layer will land.
export function DropDivider({ edge }: DropDividerProp) {
  if (!edge) return null;
  return (
    <div aria-hidden="true" className={cn(
      "pointer-events-none absolute inset-x-0 z-20 flex items-center",
      edge === "top" ? "-top-[5px]" : "-bottom-[5px]",
    )}>
      <span className="size-2.5 shrink-0 rounded-full border-2 border-blue-600 bg-white" />
      <span className="h-1 flex-1 rounded-full bg-blue-600" />
    </div>
  );
}
