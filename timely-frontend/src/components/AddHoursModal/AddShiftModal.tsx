import {useState} from "react";
import styles from "./AddShiftModal.module.css";
import {LucideClock, LucideX} from "lucide-react";
import {useI18n} from "../../i18n/I18nContext";

interface AddShiftModalProps {
    onClose: () => void;
    onSubmit: (data: { shiftStart: string; shiftEnd: string }) => void;
    selectedDate: Date;
}

const toDateTimeLocalValue = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, "0");

    return [
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    ].join("T");
};

const AddShiftModal = ({
                           onClose,
                           onSubmit,
                           selectedDate,
                       }: AddShiftModalProps) => {
    const {locale, t} = useI18n();
    const [shiftStart, setShiftStart] = useState(() => {
        const initialStart = new Date(selectedDate);
        initialStart.setHours(9, 0, 0, 0);
        return toDateTimeLocalValue(initialStart);
    });
    const [shiftEnd, setShiftEnd] = useState(() => {
        const initialEnd = new Date(selectedDate);
        initialEnd.setHours(17, 0, 0, 0);
        return toDateTimeLocalValue(initialEnd);
    });
    const [error, setError] = useState("");
    const selectedDateLabel = selectedDate.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!shiftStart || !shiftEnd) {
            setError(t("bothTimesRequired"));
            return;
        }

        const shiftStartDate = new Date(shiftStart);
        const shiftEndDate = new Date(shiftEnd);

        if (
            Number.isNaN(shiftStartDate.getTime()) ||
            Number.isNaN(shiftEndDate.getTime())
        ) {
            setError(t("invalidTimes"));
            return;
        }

        if (shiftEndDate <= shiftStartDate) {
            setError(t("endAfterStart"));
            return;
        }

        setError("");

        onSubmit({
            shiftStart: shiftStartDate.toISOString(),
            shiftEnd: shiftEndDate.toISOString(),
        });

        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-shift-title"
            >
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>
                            {selectedDateLabel}
                        </span>

                        <h2 id="add-shift-title" className={styles.title}>
                            {t("addShift")}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label={t("closeAddShift")}
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryIcon}>
                        <LucideClock size={20} />
                    </div>

                    <div>
                        <p className={styles.summaryTitle}>
                            {t("shiftTime")}
                        </p>

                        <p className={styles.summaryText}>
                            {t("shiftTimeHelp")}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <div className={styles.fieldRow}>
                        <label
                            htmlFor="shiftStart"
                            className={styles.label}
                        >
                            {t("start")}
                        </label>

                        <input
                            id="shiftStart"
                            type="datetime-local"
                            value={shiftStart}
                            onChange={(event) => {
                                const nextStart = event.target.value;
                                setShiftStart(nextStart);

                                if (shiftEnd && nextStart >= shiftEnd) {
                                    const nextEnd = new Date(nextStart);
                                    nextEnd.setHours(nextEnd.getHours() + 8);
                                    setShiftEnd(toDateTimeLocalValue(nextEnd));
                                }
                            }}
                            className={styles.dateInput}
                            required
                        />
                    </div>

                    <div className={styles.fieldRow}>
                        <label
                            htmlFor="shiftEnd"
                            className={styles.label}
                        >
                            {t("end")}
                        </label>

                        <input
                            id="shiftEnd"
                            type="datetime-local"
                            value={shiftEnd}
                            min={shiftStart}
                            onChange={(event) => setShiftEnd(event.target.value)}
                            className={styles.dateInput}
                            required
                        />
                    </div>

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        {t("saveShift")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddShiftModal;
