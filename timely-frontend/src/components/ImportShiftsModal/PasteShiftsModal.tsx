import {useState} from "react";
import styles from "./PasteShiftsModal.module.css";
import {ClipboardPaste, LucideX} from "lucide-react";
import {useI18n} from "../../i18n/I18nContext";

interface ImportShiftsModalProps {
    onClose: () => void;
    onSubmit: (text: string) => Promise<void>;
}

const PasteShiftsModal = ({
                               onClose,
                               onSubmit,
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
            setError((err as Error).message);
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
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryIcon}>
                        <ClipboardPaste size={20} />
                    </div>

                    <div>
                        <p className={styles.summaryTitle}>
                            {t("importMultiple")}
                        </p>

                        <p className={styles.summaryText}>
                            {t("importHelp")}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <label
                        htmlFor="shiftImport"
                        className={styles.label}
                    >
                        {t("shiftList")}
                    </label>

                    <textarea
                        id="shiftImport"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={`02.05 10:00-17:00
03.05 12:00-20:30
05.05 08:15-16:15`}
                        rows={10}
                        className={styles.textarea}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                    />

                    <p className={styles.helpText}>
                        {t("exampleFormat")} <span>02.05 10:00-17:00</span>
                    </p>

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={styles.submitButton}
                    >
                        {isLoading ? t("importing") : t("importShifts")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasteShiftsModal;
