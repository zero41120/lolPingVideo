import { DndContext, DragOverlay, PointerSensor, rectIntersection, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { newItem, type SequenceItem } from "../config";
import { pingById, type PingId } from "../pings";
import { Button } from "../ui/button";
import { PingPicker } from "./PingPicker";
import { usePingLabels } from "./ping-labels";
import { dropEdgeFor, moveKey } from "./sequence-order";
import { SequenceRow } from "./SequenceRow";

type SequenceEditorProp = {
  pings: SequenceItem[];
  onChange: (pings: SequenceItem[]) => void;
};

type DragPreviewProp = { item: SequenceItem };

/** Follows the pointer while dragging */
function DragPreview(prop: DragPreviewProp) {
  const labels = usePingLabels();
  const { id } = prop.item;
  return (
    <div className="flex min-w-0 cursor-grabbing items-center gap-2 rounded border border-neutral-400 bg-white p-2 shadow-lg">
      <GripVertical className="size-3.5 shrink-0 text-neutral-400" />
      <img src={`./textures/${pingById(id).icon}.png`} alt="" className="size-6 shrink-0" />
      <span className="truncate text-xs font-medium">{labels[id]}</span>
    </div>
  );
}

export function SequenceEditor(prop: SequenceEditorProp) {
  const { pings, onChange } = prop;
  const { t } = useTranslation();
  const [nextPing, setNextPing] = useState<PingId>("missing");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const pointer = useSensor(PointerSensor, { activationConstraint: { distance: 4 } });
  const sensors = useSensors(pointer);
  const keys = pings.map((item) => item.key);
  const isEmpty = pings.length === 0;
  const lastIndex = pings.length - 1;
  const activeItem = pings.find((item) => item.key === activeKey);

  function endDrag() {
    setActiveKey(null);
    setOverKey(null);
  }

  function reorder(event: DragEndEvent) {
    endDrag();
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const orderedKeys = moveKey(keys, String(active.id), String(over.id));
    if (!orderedKeys) return;
    const byKey = new Map(pings.map((item) => [item.key, item]));
    const reordered = orderedKeys.map((key) => byKey.get(key)!);
    onChange(reordered);
  }

  function addPing() {
    onChange([...pings, newItem(nextPing)]);
  }

  function patchItem(key: string, patch: Partial<SequenceItem>) {
    onChange(pings.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    onChange(pings.filter((item) => item.key !== key));
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t("sequence.title")}</h2>
        <Button variant="ghost" size="xs" disabled={isEmpty} onClick={() => onChange([])}>
          <Trash2 />
          {t("sequence.clear")}
        </Button>
      </div>

      {isEmpty && <p className="py-3 text-center text-muted-foreground">{t("sequence.empty")}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={({ active }) => setActiveKey(String(active.id))}
        onDragOver={({ over }) => setOverKey(over ? String(over.id) : null)}
        onDragEnd={reorder}
        onDragCancel={endDrag}
      >
        {/* A tinted well, like the layer list in Shizuru Schedule Maker. Padding keeps the drop divider visible above the first and below the last row */}
        <ol className="custom-scrollbar flex max-h-[28rem] flex-col gap-1.5 overflow-y-auto rounded-lg border border-slate-200/80 bg-[#f4f5f6] p-1.5 empty:hidden">
          {pings.map((item, index) => (
            <SequenceRow
              key={item.key}
              item={item}
              index={index}
              isLast={index === lastIndex}
              dropEdge={dropEdgeFor(keys, item.key, activeKey, overKey)}
              onChange={(patch) => patchItem(item.key, patch)}
              onRemove={() => removeItem(item.key)}
            />
          ))}
        </ol>
        <DragOverlay dropAnimation={null}>{activeItem && <DragPreview item={activeItem} />}</DragOverlay>
      </DndContext>

      <div className="flex items-center gap-2 border-t border-neutral-200/60 pt-3">
        <PingPicker value={nextPing} onChange={setNextPing} />
        <Button variant="outline" size="sm" onClick={addPing}>
          <Plus />
          {t("sequence.add")}
        </Button>
      </div>
    </section>
  );
}
