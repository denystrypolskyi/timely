import {Languages} from "lucide-react";
import {Language, supportedLanguages, useI18n} from "../../i18n/I18nContext";
import styles from "./LanguageSwitcher.module.css";

const LanguageSwitcher = () => {
    const {language, setLanguage, t} = useI18n();
    const languageNames = {
        en: t("english"),
        uk: t("ukrainian"),
        ru: t("russian"),
    };
    return (
        <label className={styles.switcher}>
            <Languages size={17} aria-hidden="true"/>
            <span className={styles.visuallyHidden}>{t("language")}</span>
            <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as Language)}
                aria-label={t("language")}
            >
                {supportedLanguages.map((code) => (
                    <option key={code} value={code}>
                        {languageNames[code]}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default LanguageSwitcher;
