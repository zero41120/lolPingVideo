import { ALL_PINGS, type PingId } from "../pings";
import { cn } from "../lib/utils";
import { usePingLabels } from "./ping-labels";

type PingIconBarProp = {
  value: PingId;
  onChange: (id: PingId) => void;
};

/** One button per ping. The selected one is framed in the ping's color. */
export function PingIconBar(prop: PingIconBarProp) {
  const { value, onChange } = prop;
  const labels = usePingLabels();

  return (
    <div className="flex min-w-0 items-center gap-0.5 rounded-md border border-slate-200/80 bg-slate-50 p-0.5">
      {ALL_PINGS.map((ping) => {
        const isSelected = ping.id === value;
        const selectedStyle = isSelected ? { borderColor: ping.color } : undefined;
        return (
          <button
            key={ping.id}
            type="button"
            title={labels[ping.id]}
            style={selectedStyle}
            className={cn(
              "cursor-pointer rounded border p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "bg-white shadow-2xs" : "border-transparent opacity-60 hover:bg-white hover:opacity-100",
            )}
            onClick={() => onChange(ping.id)}
          >
            <img src={`./textures/${ping.icon}.png`} alt="" className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
