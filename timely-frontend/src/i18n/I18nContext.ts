import {createContext, useContext} from "react";
import {TranslationKey} from "./translations";

export const supportedLanguages = ["en", "uk", "ru"] as const;
export type Language = typeof supportedLanguages[number];

export interface I18nValue {
    language: Language;
    locale: string;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nValue | null>(null);

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useI18n must be used within I18nProvider");
    return context;
};
