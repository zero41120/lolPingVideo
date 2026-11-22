import { Clapperboard, FileVideo, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PingConfig } from "../config";
import { downloadBlob } from "../lib/download-blob";
import { Button } from "../ui/button";
import { UnsupportedError, exportProres, exportWebm, type ProgressCallback } from "./export";

type ExportPanelProp = { config: PingConfig };

type Exporter = (config: PingConfig, onProgress: ProgressCallback, signal: AbortSignal) => Promise<Blob>;

type ExportState =
  | { kind: "idle" }
  | { kind: "rendering"; fraction: number }
  | { kind: "error"; message: string };

const isAbort = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

export function ExportPanel(prop: ExportPanelProp) {
  const { config } = prop;
  const { t } = useTranslation();
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const isRendering = state.kind === "rendering";
  const hasPings = config.pings.length > 0;
  const canExport = hasPings && !isRendering;

  async function run(exporter: Exporter, filename: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ kind: "rendering", fraction: 0 });
    try {
      const blob = await exporter(config, (fraction) => setState({ kind: "rendering", fraction }), controller.signal);
      downloadBlob(blob, filename);
      setState({ kind: "idle" });
    } catch (error) {
      if (isAbort(error)) return setState({ kind: "idle" });
      const message = error instanceof UnsupportedError ? t("export.unsupported") : t("export.failed", { message: String(error) });
      setState({ kind: "error", message });
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const percent = state.kind === "rendering" ? Math.round(state.fraction * 100) : 0;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold">{t("export.title")}</h2>
      <div className="grid grid-cols-1 gap-2">
        <Button variant="outline" disabled={!canExport} onClick={() => run(exportWebm, "ping.webm")}>
          <FileVideo />
          {t("export.webm")}
          <span className="text-muted-foreground">{t("export.webm.hint")}</span>
        </Button>
        <Button variant="outline" disabled={!canExport} onClick={() => run(exportProres, "ping.mov")}>
          <Clapperboard />
          {t("export.prores")}
          <span className="text-muted-foreground">{t("export.prores.hint")}</span>
        </Button>
      </div>

      {isRendering && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />{t("export.progress", { percent })}</span>
            <Button variant="ghost" size="xs" onClick={cancel}>{t("export.cancel")}</Button>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full bg-neutral-900 transition-[width]" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
      {state.kind === "error" && <p className="text-destructive">{state.message}</p>}
    </section>
  );
}
