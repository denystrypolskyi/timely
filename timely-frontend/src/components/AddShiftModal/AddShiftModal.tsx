import {useMemo, useState} from "react";
import styles from "./AddShiftModal.module.css";
import {LucideArrowRight, LucideCheck, LucideX} from "lucide-react";
import {useI18n} from "../../i18n/I18nContext";

interface AddShiftModalProps {
    onClose: () => void;
    onSubmit: (data: { shiftStart: string; shiftEnd: string }) => Promise<unknown>;
    selectedDate: Date;
}

interface TimePickerProps {
    id: string;
    label: string;
    initialValue: string;
    value: string | null;
    onChange: (value: string | null) => void;
    disabled: boolean;
}

const TimePicker = ({id, label, initialValue, value, onChange, disabled}: TimePickerProps) => {
    const {t} = useI18n();
    const [hourText, setHourText] = useState(initialValue.slice(0, 2));
    const [minuteText, setMinuteText] = useState(initialValue.slice(3));

    const parseTime = (hours: string, minutes: string) => {
        if (!/^\d{1,2}$/.test(hours) || !/^\d{1,2}$/.test(minutes)) return null;
        const hour = Number(hours);
        const minute = Number(minutes);
        if (hour > 23 || minute > 59) return null;

        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    };

    return (
        <div className={styles.timePicker} id={id} role="group" aria-label={label}>
            <input
                className={styles.nativeTimeInput}
                type="time"
                aria-label={label}
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value || null)}
                disabled={disabled}
            />
            <input
                className={`${styles.timeTextInput} ${styles.customTimePart}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label={`${label}: ${t("hour")}`}
                aria-invalid={!/^\d{1,2}$/.test(hourText) || Number(hourText) > 23}
                value={hourText}
                maxLength={2}
                disabled={disabled}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => {
                    const nextHour = event.target.value;
                    setHourText(nextHour);
                    onChange(parseTime(nextHour, minuteText));
                }}
                onBlur={() => {
                    if (parseTime(hourText, minuteText)) setHourText(hourText.padStart(2, "0"));
                }}
                placeholder="HH"
            />
            <span className={`${styles.timeSeparator} ${styles.customTimePart}`} aria-hidden="true">:</span>
            <input
                className={`${styles.timeTextInput} ${styles.customTimePart}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label={`${label}: ${t("minute")}`}
                aria-invalid={!/^\d{1,2}$/.test(minuteText) || Number(minuteText) > 59}
                value={minuteText}
                maxLength={2}
                disabled={disabled}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => {
                    const nextMinute = event.target.value;
                    setMinuteText(nextMinute);
                    onChange(parseTime(hourText, nextMinute));
                }}
                onBlur={() => {
                    if (parseTime(hourText, minuteText)) setMinuteText(minuteText.padStart(2, "0"));
                }}
                placeholder="MM"
            />
        </div>
    );
};

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
    const [startTime, setStartTime] = useState<string | null>("09:00");
    const [endTime, setEndTime] = useState<string | null>("17:00");
    const [endDayOffset, setEndDayOffset] = useState<0 | 1>(0);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

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

    const handleStartTimeChange = (nextStartTime: string | null) => {
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

    const handleEndTimeChange = (nextEndTime: string | null) => {
        setEndTime(nextEndTime);
        setError("");

        if (startTime && nextEndTime) {
            setEndDayOffset(
                timeToMinutes(nextEndTime) <= timeToMinutes(startTime) ? 1 : 0
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startTime || !endTime) {
            setError(t("invalidTimes"));
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

        setIsSaving(true);
        try {
            await onSubmit({
                shiftStart: shiftStartDate.toISOString(),
                shiftEnd: shiftEndDate.toISOString(),
            });
            onClose();
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : t("saveShiftFailed"));
        } finally {
            setIsSaving(false);
        }
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
                        disabled={isSaving}
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.timeFields}>
                        <div className={styles.fieldRow}>
                            <span className={styles.label}>
                                {t("start")}
                            </span>

                            <TimePicker
                                id="shiftStart"
                                label={t("start")}
                                initialValue="09:00"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                disabled={isSaving}
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
                            <span className={styles.label}>
                                {t("end")}
                            </span>

                            <TimePicker
                                id="shiftEnd"
                                label={t("end")}
                                initialValue="17:00"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                disabled={isSaving}
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
                                disabled={isSaving}
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
                                disabled={isSaving}
                                onClick={() => {
                                    setEndDayOffset(1);
                                    setError("");
                                }}
                            >
                                <span>{t("nextDay")}</span>
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

                    <button type="submit" className={styles.submitButton} disabled={isSaving}>
                        {!isSaving && <LucideCheck size={18} aria-hidden="true" />}
                        {isSaving ? t("savingShift") : t("saveShift")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddShiftModal;
