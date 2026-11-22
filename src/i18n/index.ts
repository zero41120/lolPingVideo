import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zhTW from "./locales/zh_TW.json";

const storageKey = "lolping-video.language";
let savedLanguage: string | null = null;
try { savedLanguage = localStorage.getItem(storageKey); } catch {}

const isSavedSupported = savedLanguage === "en" || savedLanguage === "zh-TW";
const prefersChinese = navigator.language.toLowerCase().startsWith("zh");
const detected = prefersChinese ? "zh-TW" : "en";
const language = isSavedSupported ? savedLanguage! : detected;

// Keys are literal, flat strings: t("options.gap") is directly searchable.
await i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, "zh-TW": { translation: zhTW } },
  lng: language,
  fallbackLng: "en",
  supportedLngs: ["en", "zh-TW"],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});

function handleLanguageChanged(next: string) {
  document.documentElement.lang = next;
  document.title = i18n.t("app.title");
  try { localStorage.setItem(storageKey, next); } catch {}
}

handleLanguageChanged(i18n.language);
i18n.on("languageChanged", handleLanguageChanged);

export default i18n;
