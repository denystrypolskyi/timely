import {useState} from "react";
import styles from "./PasteShiftsModal.module.css";
import {ClipboardPaste, LucideX} from "lucide-react";
import {useI18n} from "../../i18n/I18nContext";

interface ImportShiftsModalProps {
    onClose: () => void;
    onSubmit: (text: string) => Promise<void>;
    year: number;
}

const PasteShiftsModal = ({
                               onClose,
                               onSubmit,
                               year,
                           }: ImportShiftsModalProps) => {
    const {t} = useI18n();
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) {
            setError(t("enterShift"));
            return;
        }

        try {
            setError("");
            setIsLoading(true);

            await onSubmit(text);

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : t("importFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="paste-shifts-title"
            >
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>
                            {t("bulkEntry")}
                        </span>

                        <h2 id="paste-shifts-title" className={styles.title}>
                            {t("pasteShifts")}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label={t("closePasteShifts")}
                        disabled={isLoading}
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <p className={styles.instructions}>
                        {t("importHelp", {year})}
                    </p>

                    <div className={styles.example}>
                        <span>{t("exampleFormat")}</span>
                        <code>02.05 10:00-17:00</code>
                    </div>

                    <label
                        htmlFor="shiftImport"
                        className={styles.label}
                    >
                        {t("shiftList")}
                    </label>

                    <textarea
                        id="shiftImport"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setError("");
                        }}
                        placeholder={t("pasteShiftsPlaceholder")}
                        rows={6}
                        className={styles.textarea}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        disabled={isLoading}
                    />

                    {error && (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={styles.submitButton}
                    >
                        <ClipboardPaste size={17} aria-hidden="true" />
                        {isLoading ? t("importing") : t("importShifts")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasteShiftsModal;
