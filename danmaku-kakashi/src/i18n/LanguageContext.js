import React, { createContext, useContext, useState } from 'react';
import i18n from 'i18next';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(i18n.language);

  const handleLanguageChange = (newLang) => {
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, handleLanguageChange }}>
      {children}
    </LanguageContext.Provider>
  );
};