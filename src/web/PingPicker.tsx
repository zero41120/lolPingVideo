import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";
import { ALL_PINGS, pingById, type PingId } from "../pings";
import { usePingLabels } from "./ping-labels";

type PingPickerProp = {
  value: PingId;
  onChange: (id: PingId) => void;
};

type PingOptionProp = { id: PingId; label: string };

/** Icon + name. Radix copies the selected item's text into the trigger, so the trigger shows the icon too */
function PingOptionText(prop: PingOptionProp) {
  const iconUrl = `./textures/${pingById(prop.id).icon}.png`;
  return (
    <span className="flex items-center gap-2">
      <img src={iconUrl} alt="" className="size-6 shrink-0" />
      <span className="truncate">{prop.label}</span>
    </span>
  );
}

export function PingPicker(prop: PingPickerProp) {
  const { value, onChange } = prop;
  const labels = usePingLabels();

  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as PingId)}>
      <Select.Trigger className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent py-1 pr-3 pl-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className="z-50 max-h-80 w-(--radix-select-trigger-width) min-w-52 overflow-hidden rounded-md border border-neutral-200 bg-white text-sm shadow-md">
          <Select.Viewport className="custom-scrollbar p-1">
            {ALL_PINGS.map((ping) => (
              <Select.Item key={ping.id} value={ping.id} className="relative flex cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 outline-none select-none data-[highlighted]:bg-accent">
                <Select.ItemText>
                  <PingOptionText id={ping.id} label={labels[ping.id]} />
                </Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check className="size-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
