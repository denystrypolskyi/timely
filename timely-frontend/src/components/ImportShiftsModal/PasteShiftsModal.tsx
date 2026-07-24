import {useState} from "react";
import styles from "./PasteShiftsModal.module.css";
import {ClipboardPaste, LucideX} from "lucide-react";

interface ImportShiftsModalProps {
    onClose: () => void;
    onSubmit: (text: string) => Promise<void>;
}

const PasteShiftsModal = ({
                               onClose,
                               onSubmit,
                           }: ImportShiftsModalProps) => {
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) {
            setError("Please enter at least one shift.");
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
                            Bulk entry
                        </span>

                        <h2 id="paste-shifts-title" className={styles.title}>
                            Paste shifts
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close paste shifts modal"
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
                            Import multiple shifts
                        </p>

                        <p className={styles.summaryText}>
                            Paste one shift per line using day, month, start, and end time.
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
                        Shift list
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
                        Example format: <span>02.05 10:00-17:00</span>
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
                        {isLoading ? "Importing..." : "Import shifts"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasteShiftsModal;
