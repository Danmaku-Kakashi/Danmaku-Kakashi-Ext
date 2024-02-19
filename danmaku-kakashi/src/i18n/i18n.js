import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
import translationEN from './ENtranslation.json';
import translationZH from './ZHtranslation.json';

const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationZH
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    keySeparator: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;