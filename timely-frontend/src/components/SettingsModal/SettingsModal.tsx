import {useState} from "react";
import styles from "./SettingsModal.module.css";
import {LucideCheck, LucideSettings, LucideX} from "lucide-react";
import {useI18n} from "../../i18n/I18nContext";
import {Currency, supportedCurrencies} from "../../hooks/useHourlyRate";

interface SettingsModalProps {
    onClose: () => void;
    onSave: (newRate: number) => void;
    hourlyRate: number;
    currency: Currency;
    onCurrencyChange: (currency: Currency) => void;
}

const SettingsModal = ({
                           onClose,
                           hourlyRate,
                           onSave,
                           currency,
                           onCurrencyChange,
                       }: SettingsModalProps) => {
    const {t} = useI18n();
    const [newHourlyRate, setNewHourlyRate] = useState(String(hourlyRate));
    const [newCurrency, setNewCurrency] = useState<Currency>(currency);

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();
        onSave(Number(newHourlyRate));
        onCurrencyChange(newCurrency);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
            >
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>
                            {t("preferences")}
                        </span>

                        <h2 id="settings-title" className={styles.title}>
                            {t("settings")}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label={t("closeSettings")}
                    >
                        <LucideX size={20}/>
                    </button>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryIcon}>
                        <LucideSettings size={20}/>
                    </div>

                    <div>
                        <p className={styles.summaryTitle}>
                            {t("salaryEstimate")}
                        </p>

                        <p className={styles.summaryText}>
                            {t("salaryEstimateHelp")}
                        </p>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSave}>
                    <div className={styles.fieldGrid}>
                        <div className={styles.controlGroup}>
                            <label htmlFor="hourlyRate" className={styles.label}>
                                {t("hourlyRate")}
                            </label>

                            <div className={styles.inputShell}>
                                <input
                                    type="number"
                                    id="hourlyRate"
                                    value={newHourlyRate}
                                    onChange={(event) => setNewHourlyRate(event.target.value)}
                                    className={styles.hourlyRateInput}
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label htmlFor="currency" className={styles.label}>
                                {t("currency")}
                            </label>

                            <select
                                id="currency"
                                className={styles.currencySelect}
                                value={newCurrency}
                                onChange={(event) => setNewCurrency(event.target.value as Currency)}
                            >
                                {supportedCurrencies.map((currencyCode) => (
                                    <option key={currencyCode} value={currencyCode}>
                                        {currencyCode}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className={styles.saveButton}>
                        <LucideCheck size={18} aria-hidden="true"/>
                        {t("saveChanges")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
