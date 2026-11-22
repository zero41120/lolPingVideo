import { useTranslation } from "react-i18next";

export function LanguagePicker() {
  const { t, i18n } = useTranslation();

  return (
    <select
      aria-label={t("nav.language")}
      value={i18n.resolvedLanguage}
      onChange={event => { void i18n.changeLanguage(event.target.value); }}
      className="h-8 rounded border border-neutral-300 bg-white px-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      <option value="en" lang="en">English</option>
      <option value="zh-TW" lang="zh-TW">繁體中文</option>
    </select>
  );
}
