import {ReactNode, useEffect, useMemo, useState} from "react";
import {I18nContext, Language, supportedLanguages} from "./I18nContext";
import {TranslationKey, translations} from "./translations";

const STORAGE_KEY = "timelyLanguage";
const locales: Record<Language, string> = {en: "en-US", uk: "uk-UA", ru: "ru-RU"};

const getInitialLanguage = (): Language => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (supportedLanguages.includes(saved as Language)) return saved as Language;
    const browserLanguage = navigator.language.toLowerCase().split("-")[0];
    return supportedLanguages.includes(browserLanguage as Language) ? browserLanguage as Language : "en";
};

export const I18nProvider = ({children}: {children: ReactNode}) => {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
        document.querySelector('meta[name="description"]')
            ?.setAttribute("content", translations[language].appDescription);
    }, [language]);

    const value = useMemo(() => {
        const t = (key: TranslationKey, values: Record<string, string | number> = {}) =>
            Object.entries(values).reduce(
                (message, [name, replacement]) =>
                    message.split(`{${name}}`).join(String(replacement)),
                translations[language][key]
            );
        return {language, locale: locales[language], setLanguage, t};
    }, [language]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
