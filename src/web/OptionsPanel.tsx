import { useTranslation } from "react-i18next";
import type { PingConfig } from "../config";
import { Checkbox } from "../ui/checkbox";

type OptionsPanelProp = {
  config: PingConfig;
  onChange: (patch: Partial<PingConfig>) => void;
};

type ToggleProp = { label: string; checked: boolean; onChange: (checked: boolean) => void };

function Toggle(prop: ToggleProp) {
  return (
    <label className="flex items-center gap-2">
      <Checkbox checked={prop.checked} onCheckedChange={(state) => prop.onChange(state === true)} />
      <span>{prop.label}</span>
    </label>
  );
}

export function OptionsPanel(prop: OptionsPanelProp) {
  const { config, onChange } = prop;
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold">{t("options.title")}</h2>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Toggle label={t("options.wheel")} checked={config.showWheel} onChange={(showWheel) => onChange({ showWheel })} />
        <Toggle label={t("options.sound")} checked={config.sound} onChange={(sound) => onChange({ sound })} />
      </div>
    </section>
  );
}
