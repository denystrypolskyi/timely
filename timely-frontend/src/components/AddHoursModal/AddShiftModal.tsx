import {useMemo, useState} from "react";
import styles from "./AddShiftModal.module.css";
import {LucideArrowRight, LucideClock, LucideMoon, LucideX} from "lucide-react";
import {useI18n} from "../../i18n/I18nContext";

interface AddShiftModalProps {
    onClose: () => void;
    onSubmit: (data: { shiftStart: string; shiftEnd: string }) => void;
    selectedDate: Date;
}

const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const dateAtTime = (date: Date, time: string, dayOffset = 0) => {
    const [hours, minutes] = time.split(":").map(Number);
    const result = new Date(date);

    result.setDate(result.getDate() + dayOffset);
    result.setHours(hours, minutes, 0, 0);

    return result;
};

const AddShiftModal = ({
                           onClose,
                           onSubmit,
                           selectedDate,
                       }: AddShiftModalProps) => {
    const {locale, t} = useI18n();
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [endDayOffset, setEndDayOffset] = useState<0 | 1>(0);
    const [error, setError] = useState("");

    const nextDate = useMemo(() => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        return date;
    }, [selectedDate]);

    const formatDate = (date: Date, includeYear = false) =>
        date.toLocaleDateString(locale, {
            weekday: "short",
            day: "numeric",
            month: "short",
            ...(includeYear ? {year: "numeric"} : {}),
        });

    const selectedDateLabel = formatDate(selectedDate, true);
    const durationMinutes = startTime && endTime
        ? timeToMinutes(endTime) - timeToMinutes(startTime) + endDayOffset * 24 * 60
        : 0;

    const handleStartTimeChange = (nextStartTime: string) => {
        setStartTime(nextStartTime);
        setError("");

        if (
            nextStartTime &&
            endTime &&
            timeToMinutes(endTime) <= timeToMinutes(nextStartTime)
        ) {
            setEndDayOffset(1);
        }
    };

    const handleEndTimeChange = (nextEndTime: string) => {
        setEndTime(nextEndTime);
        setError("");

        if (startTime && nextEndTime) {
            setEndDayOffset(
                timeToMinutes(nextEndTime) <= timeToMinutes(startTime) ? 1 : 0
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!startTime || !endTime) {
            setError(t("bothTimesRequired"));
            return;
        }

        const shiftStartDate = dateAtTime(selectedDate, startTime);
        const shiftEndDate = dateAtTime(selectedDate, endTime, endDayOffset);

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

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.timeFields}>
                        <div className={styles.fieldRow}>
                            <label htmlFor="shiftStart" className={styles.label}>
                                {t("start")}
                            </label>

                            <input
                                id="shiftStart"
                                type="time"
                                value={startTime}
                                onChange={(event) =>
                                    handleStartTimeChange(event.target.value)
                                }
                                className={styles.timeInput}
                                step="300"
                                required
                            />

                            <span className={styles.dateHint}>
                                {formatDate(selectedDate)}
                            </span>
                        </div>

                        <LucideArrowRight
                            className={styles.timeArrow}
                            size={18}
                            aria-hidden="true"
                        />

                        <div className={styles.fieldRow}>
                            <label htmlFor="shiftEnd" className={styles.label}>
                                {t("end")}
                            </label>

                            <input
                                id="shiftEnd"
                                type="time"
                                value={endTime}
                                onChange={(event) =>
                                    handleEndTimeChange(event.target.value)
                                }
                                className={styles.timeInput}
                                step="300"
                                required
                            />

                            <span className={styles.dateHint}>
                                {formatDate(endDayOffset === 1 ? nextDate : selectedDate)}
                            </span>
                        </div>
                    </div>

                    <fieldset className={styles.endDateFieldset}>
                        <legend className={styles.label}>{t("endDate")}</legend>

                        <div className={styles.dayOptions}>
                            <button
                                type="button"
                                className={`${styles.dayOption} ${
                                    endDayOffset === 0 ? styles.dayOptionActive : ""
                                }`}
                                aria-pressed={endDayOffset === 0}
                                onClick={() => {
                                    setEndDayOffset(0);
                                    setError("");
                                }}
                            >
                                <span>{t("sameDay")}</span>
                                <small>{formatDate(selectedDate)}</small>
                            </button>

                            <button
                                type="button"
                                className={`${styles.dayOption} ${
                                    endDayOffset === 1 ? styles.dayOptionActive : ""
                                }`}
                                aria-pressed={endDayOffset === 1}
                                onClick={() => {
                                    setEndDayOffset(1);
                                    setError("");
                                }}
                            >
                                <span className={styles.optionTitle}>
                                    <LucideMoon size={15} aria-hidden="true" />
                                    {t("nextDay")}
                                </span>
                                <small>{formatDate(nextDate)}</small>
                            </button>
                        </div>
                    </fieldset>

                    {durationMinutes > 0 && (
                        <p className={styles.durationPreview} aria-live="polite">
                            {t("shiftDuration")}:{" "}
                            <strong>
                                {Math.floor(durationMinutes / 60)}{t("hoursShort")}{" "}
                                {durationMinutes % 60}{t("minutesShort")}
                            </strong>
                            {endDayOffset === 1 && (
                                <span className={styles.overnightBadge}>
                                    {t("overnight")}
                                </span>
                            )}
                        </p>
                    )}

                    {error && (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" className={styles.submitButton}>
                        {t("saveShift")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddShiftModal;
