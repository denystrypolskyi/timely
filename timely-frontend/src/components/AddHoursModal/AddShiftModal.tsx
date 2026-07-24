import {useState} from "react";
import styles from "./AddShiftModal.module.css";
import {LucideClock, LucideX} from "lucide-react";

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
    const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!shiftStart || !shiftEnd) {
            setError("Both shift start and end times are required.");
            return;
        }

        const shiftStartDate = new Date(shiftStart);
        const shiftEndDate = new Date(shiftEnd);

        if (
            Number.isNaN(shiftStartDate.getTime()) ||
            Number.isNaN(shiftEndDate.getTime())
        ) {
            setError("Enter a valid start and end time.");
            return;
        }

        if (shiftEndDate <= shiftStartDate) {
            setError("Shift end must be later than shift start.");
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
                            Add shift
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close add shift modal"
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
                            Shift time
                        </p>

                        <p className={styles.summaryText}>
                            Choose a start and end time for this work period.
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
                            Start
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
                            End
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
                        Save shift
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddShiftModal;
