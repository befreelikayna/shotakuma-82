
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en.json";
import frTranslation from "./locales/fr.json";
import arTranslation from "./locales/ar.json";
import koTranslation from "./locales/ko.json";
import jaTranslation from "./locales/ja.json";
import esTranslation from "./locales/es.json";
import ruTranslation from "./locales/ru.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      ar: { translation: arTranslation },
      ko: { translation: koTranslation },
      ja: { translation: jaTranslation },
      es: { translation: esTranslation },
      ru: { translation: ruTranslation }
    },
    fallbackLng: "en",
    debug: false,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
