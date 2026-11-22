import { ClockFading, GripVertical, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SequenceItem } from "../config";
import { cn } from "../lib/utils";
import type { PingId } from "../pings";
import { DropDivider, type DropEdge } from "./DropDivider";
import { PingIconBar } from "./PingIconBar";
import { usePingLabels } from "./ping-labels";
import { useRowDrag } from "./use-row-drag";

// The slider covers the common range. The number box accepts anything up to INPUT_MAX_S.
const SLIDER_MIN_S = 0.1;
const SLIDER_MAX_S = 1;
const GAP_STEP_S = 0.05;
const INPUT_MAX_S = 10;

const FILL_COLOR = "#111827";
const TRACK_COLOR = "#d1d5db";

type SequenceRowProp = {
  item: SequenceItem;
  index: number;
  isLast: boolean;
  dropEdge?: DropEdge;
  onChange: (patch: Partial<SequenceItem>) => void;
  onRemove: () => void;
};

/** Dark fill up to the thumb, gray after it */
function sliderTrack(value: number): string {
  const fraction = (value - SLIDER_MIN_S) / (SLIDER_MAX_S - SLIDER_MIN_S);
  const percent = fraction * 100;
  return `linear-gradient(to right, ${FILL_COLOR} ${percent}%, ${TRACK_COLOR} ${percent}%)`;
}

export function SequenceRow(prop: SequenceRowProp) {
  const { item, index, isLast, dropEdge, onChange, onRemove } = prop;
  const { t } = useTranslation();
  const labels = usePingLabels();
  const row = useRowDrag(item.key);
  const sliderValue = Math.min(SLIDER_MAX_S, Math.max(SLIDER_MIN_S, item.gapS));

  function changeGapText(text: string) {
    const parsed = Number(text);
    const isNumber = text !== "" && Number.isFinite(parsed);
    if (!isNumber) return;
    const gapS = Math.min(INPUT_MAX_S, Math.max(0, parsed));
    onChange({ gapS });
  }

  return (
    <li
      ref={row.setNodeRef}
      className={cn("relative flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-2xs", row.isDragging && "opacity-40")}
    >
      <DropDivider edge={dropEdge} />
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          ref={row.setActivatorNodeRef}
          title={t("sequence.drag")}
          className="shrink-0 cursor-grab touch-none text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          {...row.attributes}
          {...row.listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <span className="w-3 shrink-0 text-center text-xs font-medium text-slate-500">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <PingIconBar value={item.id} onChange={(id: PingId) => onChange({ id })} />
        </div>
        <button
          type="button"
          title={t("sequence.remove")}
          className="shrink-0 rounded p-1 text-slate-400 transition hover:text-slate-800"
          onClick={onRemove}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 pl-[1.625rem]">
        <span className="w-24 shrink-0 truncate text-sm font-medium text-slate-800">{labels[item.id]}</span>
        <div className={cn("flex min-w-0 flex-1 items-center gap-2", isLast && "opacity-40")}>
          <ClockFading className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="range"
            title={t("sequence.gap")}
            className="lp-range w-full min-w-0"
            style={{ background: sliderTrack(sliderValue) }}
            min={SLIDER_MIN_S}
            max={SLIDER_MAX_S}
            step={GAP_STEP_S}
            value={sliderValue}
            disabled={isLast}
            onChange={(event) => onChange({ gapS: Number(event.target.value) })}
          />
          <div className="flex shrink-0 items-center rounded-md border border-slate-200 bg-white px-2 py-1">
            <input
              type="number"
              title={t("sequence.gap")}
              className="w-12 border-0 bg-transparent text-xs font-medium text-slate-800 tabular-nums outline-none disabled:cursor-not-allowed"
              min={0}
              max={INPUT_MAX_S}
              step={GAP_STEP_S}
              value={item.gapS}
              disabled={isLast}
              onChange={(event) => changeGapText(event.target.value)}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
