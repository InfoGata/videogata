import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en,
} as const;

export const availableLanguages = Object.keys(resources);

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
