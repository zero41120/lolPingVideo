import { useTranslation } from "react-i18next";
import type { PingId } from "../pings";

/** Translated ping names. Every key is a literal so it stays searchable. */
export function usePingLabels(): Record<PingId, string> {
  const { t } = useTranslation();
  return {
    danger: t("ping.danger"),
    push: t("ping.push"),
    omw: t("ping.omw"),
    allin: t("ping.allin"),
    assist: t("ping.assist"),
    needvision: t("ping.needvision"),
    missing: t("ping.missing"),
    enemyvision: t("ping.enemyvision"),
    generic: t("ping.generic"),
    bait: t("ping.bait"),
    visioncleared: t("ping.visioncleared"),
    missingflip: t("ping.missingflip"),
  };
}
