import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_CONFIG, type PingConfig } from "../config";
import { ExportPanel } from "./ExportPanel";
import { LanguagePicker } from "./LanguagePicker";
import { OptionsPanel } from "./OptionsPanel";
import { PositionCanvas } from "./PositionCanvas";
import { PreviewPanel } from "./PreviewPanel";
import { SequenceEditor } from "./SequenceEditor";
import "./index.css";

export function App() {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<PingConfig>(DEFAULT_CONFIG);
  const fontFamily = i18n.resolvedLanguage === "zh-TW" ? "'Chiron GoRound TC', sans-serif" : "Inter, sans-serif";

  function updateConfig(patch: Partial<PingConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  function moveItem(key: string, dx: number, dy: number) {
    setConfig((current) => {
      const pings = current.pings.map((item) => (item.key === key ? { ...item, dx, dy } : item));
      return { ...current, pings };
    });
  }

  return (
    <div className="grid h-svh grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-neutral-50 text-xs text-neutral-900" style={{ fontFamily }}>
      <nav className="flex min-h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 min-[480px]:px-6" aria-label={t("nav.label")}>
        <h1 className="text-sm font-semibold">{t("app.title")}</h1>
        <LanguagePicker />
      </nav>
      <main className="min-h-0 overflow-hidden p-4 min-[480px]:p-6">
        <div className="grid h-full min-h-0 grid-cols-1 gap-6 overflow-y-auto min-[960px]:grid-cols-[minmax(440px,500px)_minmax(0,1fr)] min-[960px]:overflow-hidden">
          <div className="custom-scrollbar flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
            <SequenceEditor pings={config.pings} onChange={(pings) => updateConfig({ pings })} />
            <PositionCanvas config={config} onMove={moveItem} onChange={updateConfig} />
            <OptionsPanel config={config} onChange={updateConfig} />
            <ExportPanel config={config} />
          </div>
          <PreviewPanel config={config} />
        </div>
      </main>
    </div>
  );
}
