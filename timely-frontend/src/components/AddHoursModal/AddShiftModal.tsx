import {useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./AddShiftModal.module.css";
import {LucideClock, LucideX} from "lucide-react";

interface AddShiftModalProps {
    onClose: () => void;
    onSubmit: (data: { shiftStart: string; shiftEnd: string }) => void;
    selectedDate: Date;
}

const AddShiftModal = ({
                           onClose,
                           onSubmit,
                           selectedDate,
                       }: AddShiftModalProps) => {
    const [shiftStart, setShiftStart] = useState<Date | null>(selectedDate);
    const [shiftEnd, setShiftEnd] = useState<Date | null>(selectedDate);
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

        if (shiftEnd < shiftStart) {
            setError("Shift end cannot be earlier than shift start");
            return;
        }

        setError("");

        onSubmit({
            shiftStart: shiftStart.toISOString(),
            shiftEnd: shiftEnd.toISOString(),
        });

        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>
                            {selectedDateLabel}
                        </span>

                        <h2 className={styles.title}>
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

                        <DatePicker
                            id="shiftStart"
                            selected={shiftStart}
                            onChange={(date) => {
                                setShiftStart(date);
                                setShiftEnd(date);
                            }}
                            showTimeSelect
                            timeFormat="HH:mm"
                            dateFormat="dd.MM.yyyy HH:mm"
                            className={styles.dateInput}
                            wrapperClassName={styles.datePickerWrapper}
                            calendarClassName={styles.calendar}
                            popperClassName={styles.popper}
                        />
                    </div>

                    <div className={styles.fieldRow}>
                        <label
                            htmlFor="shiftEnd"
                            className={styles.label}
                        >
                            End
                        </label>

                        <DatePicker
                            id="shiftEnd"
                            selected={shiftEnd}
                            onChange={(date) => setShiftEnd(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            dateFormat="dd.MM.yyyy HH:mm"
                            className={styles.dateInput}
                            wrapperClassName={styles.datePickerWrapper}
                            calendarClassName={styles.calendar}
                            popperClassName={styles.popper}
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
