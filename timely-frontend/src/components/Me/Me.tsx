import {useState, useRef, useEffect} from "react";
import {useShifts} from "../../hooks/useShifts";
import {useAuth} from "../../hooks/useAuth";
import {useHourlyRate} from "../../hooks/useHourlyRate";
import styles from "./Me.module.css";
import AddShiftModal from "../AddHoursModal/AddShiftModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import SettingsModal from "../SettingsModal/SettingsModal";
import PasteShiftsModal from "../ImportShiftsModal/PasteShiftsModal.tsx";

import {
    ClipboardPaste,
    LucideArrowLeft,
    LucideArrowRight,
    LucideLogOut,
    LucidePlus,
    LucideSettings,
    LucideTrash,
    LucideX,
} from "lucide-react";

import {
    formatMinutesToHours,
    getDaysInMonth,
    getShiftsForSelectedDate,
    isShiftOverlapping,
    parseShiftsFromText
} from "../../utils/utils.ts";

const formatShiftTime = (date: string) =>
    new Date(date).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Me = () => {
    const {
        shifts,
        totalMinutes,
        isLoading,
        error,
        addShift,
        deleteShift,
        setMonth,
        currentYear,
        currentMonth,
    } = useShifts();
    const {logout} = useAuth();
    const {hourlyRate, updateHourlyRate} = useHourlyRate();
    const [isAddShiftModalOpen, setIsAddShiftModalOpen] =
        useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
    const [isImportOpen, setIsImportOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const [isEditable, setIsEditable] = useState<boolean>(false);

    const selectedDateShifts = getShiftsForSelectedDate(shifts, selectedDate);
    const monthDate = new Date(currentYear, currentMonth - 1);
    const monthLabel = monthDate.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
    });
    const leadingDays = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;

    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleSaveHourlyRate = (newRate: number) => {
        updateHourlyRate(newRate);
        setIsEditable(false);
    };

    const toggleSettings = () => {
        setIsSettingsOpen((prev) => !prev);
    };

    const handleDeleteShift = async (id: number) => {
        try {
            await deleteShift(id);
        } catch (err) {
            console.error("Failed to delete shift:", err);
        }
    };

    const handlePreviousMonth = () => {
        const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        setMonth(newYear, newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        setMonth(newYear, newMonth);
    };

    const handleDayClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        day: number
    ) => {
        setSelectedDate(day);

        const rect = event.currentTarget.getBoundingClientRect();
        const dropdownWidth = Math.min(360, window.innerWidth - 32);
        const left = Math.min(
            Math.max(rect.left, 16),
            window.innerWidth - dropdownWidth - 16
        );
        const estimatedDropdownHeight = 290;
        const shouldOpenAbove =
            rect.bottom + estimatedDropdownHeight + 16 > window.innerHeight;

        setDropdownPosition({
            top: shouldOpenAbove
                ? Math.max(16, rect.top - estimatedDropdownHeight) + window.scrollY
                : rect.bottom + 8 + window.scrollY,
            left: left + window.scrollX,
        });
    };

    const handleManualImport = async (
        text: string
    ) => {
        const parsedShifts = parseShiftsFromText(
            text,
            currentYear
        );

        for (const shift of parsedShifts) {
            const shiftStartDate = shift.shiftStart;
            const shiftEndDate = shift.shiftEnd;

            if (
                isShiftOverlapping(
                    shiftStartDate,
                    shiftEndDate,
                    shifts
                )
            ) {
                console.warn(
                    `Shift overlaps. Skipped.`
                );

                continue;
            }

            await addShift({
                shiftStart: shiftStartDate
                    .toISOString()
                ,
                shiftEnd: shiftEndDate
                    .toISOString()
            });

        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                dropdownRef.current.contains(event.target as Node)
            ) {
                return;
            }
            setSelectedDate(null);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return <LoadingSpinner/>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.appHeader}>
                <nav className={styles.actions} aria-label="Account actions">
                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.actionButton}`}
                        onClick={() => setIsImportOpen(true)}
                        aria-label="Import shifts"
                        title="Import shifts"
                    >
                        <ClipboardPaste size={20} />
                        <span className={styles.actionLabel}>Import</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.actionButton}`}
                        onClick={toggleSettings}
                        aria-label="Open settings"
                        title="Settings"
                    >
                        <LucideSettings size={20} />
                        <span className={styles.actionLabel}>Settings</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.actionButton} ${styles.dangerButton}`}
                        onClick={logout}
                        aria-label="Log out"
                        title="Log out"
                    >
                        <LucideLogOut size={20} />
                        <span className={styles.actionLabel}>Log out</span>
                    </button>
                </nav>
            </header>

            {error && (
                <p className={styles.errorBanner} role="alert">
                    We couldn&apos;t load your shifts. Please try again.
                </p>
            )}

            <section className={styles.monthSection} aria-labelledby="month-heading">
                <div className={styles.calendarBar}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={handlePreviousMonth}
                        aria-label="Previous month"
                    >
                        <LucideArrowLeft size={21} />
                    </button>

                    <div className={styles.monthCopy}>
                        <span className={styles.monthEyebrow}>Your schedule</span>
                        <h1 id="month-heading" className={styles.monthDisplay}>
                            {monthLabel}
                        </h1>
                    </div>

                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={handleNextMonth}
                        aria-label="Next month"
                    >
                        <LucideArrowRight size={21} />
                    </button>
                </div>

                <div className={styles.calendarCard}>
                    <div className={styles.weekdays} aria-hidden="true">
                        {WEEKDAYS.map((weekday) => (
                            <span key={weekday}>{weekday}</span>
                        ))}
                    </div>

                    <div
                        className={styles.calendarContainer}
                        role="grid"
                        aria-label={`${monthLabel} calendar`}
                    >
                        {Array.from({length: leadingDays}, (_, index) => (
                            <span
                                key={`blank-${index}`}
                                className={styles.calendarBlank}
                                aria-hidden="true"
                            />
                        ))}

                        {Array.from(
                            {length: getDaysInMonth(currentYear, currentMonth)},
                            (_, i) => {
                                const day = i + 1;
                                const date = new Date(currentYear, currentMonth - 1, day);
                                const dayShifts = shifts.filter(
                                    (shift) => new Date(shift.shiftStart).getDate() === day
                                );
                                const hasShift = dayShifts.length > 0;
                                const today = new Date();
                                const isToday =
                                    today.getFullYear() === currentYear &&
                                    today.getMonth() + 1 === currentMonth &&
                                    today.getDate() === day;
                                const dateLabel = date.toLocaleDateString(undefined, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                });

                                return (
                                    <button
                                        type="button"
                                        role="gridcell"
                                        key={day}
                                        className={`
                                            ${styles.calendarDay}
                                            ${hasShift ? styles.dayWithShift : styles.dayEmpty}
                                            ${selectedDate === day ? styles.selected : ""}
                                            ${isToday ? styles.today : ""}
                                        `}
                                        aria-label={`${dateLabel}. ${
                                            hasShift
                                                ? `${dayShifts.length} ${dayShifts.length === 1 ? "shift" : "shifts"} recorded.`
                                                : "No shift recorded. Tap to add one."
                                        }`}
                                        aria-selected={selectedDate === day}
                                        onClick={(event) => {
                                            handleDayClick(event, day);

                                            if (!hasShift) {
                                                setIsAddShiftModalOpen(true);
                                            }
                                        }}
                                    >
                                        <span>{day}</span>
                                        {hasShift && <span className={styles.shiftDot} />}
                                    </button>
                                );
                            }
                        )}
                    </div>

                    <div className={styles.calendarLegend}>
                        <span><i className={styles.legendDot} /> Shift recorded</span>
                        <span>Tap a day to add or view</span>
                    </div>
                </div>
            </section>

            {isSettingsOpen && (
                <SettingsModal
                    onClose={toggleSettings}
                    onSave={handleSaveHourlyRate}
                    hourlyRate={hourlyRate}
                    onEditClick={handleEditClick}
                    isEditable={isEditable}
                />
            )}

            {selectedDate !== null && !isAddShiftModalOpen && (
                <>
                    <div
                        className={styles.sheetBackdrop}
                        aria-hidden="true"
                        onClick={() => setSelectedDate(null)}
                    />

                    <div
                        ref={dropdownRef}
                        className={styles.dropdown}
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="selected-day-title"
                    >
                        <div className={styles.sheetHandle} aria-hidden="true" />

                        <div className={styles.dropdownHeader}>
                            <div>
                                <span className={styles.dropdownEyebrow}>
                                    Selected day
                                </span>

                                <h2 id="selected-day-title" className={styles.dropdownTitle}>
                                    {new Date(
                                        currentYear,
                                        currentMonth - 1,
                                        selectedDate
                                    ).toLocaleDateString(undefined, {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                    })}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className={styles.sheetCloseButton}
                                onClick={() => setSelectedDate(null)}
                                aria-label="Close shift details"
                            >
                                <LucideX size={20} />
                            </button>
                        </div>

                        <div className={styles.shiftList}>
                            {selectedDateShifts.length > 0 ? (
                                selectedDateShifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        className={styles.shiftInfo}
                                    >
                                        <div className={styles.shiftSummary}>
                                            <div className={styles.shiftMetric}>
                                                <span className={styles.shiftLabel}>
                                                    Start
                                                </span>

                                                <span className={styles.shiftValue}>
                                                    {formatShiftTime(shift.shiftStart)}
                                                </span>
                                            </div>

                                            <div className={styles.shiftMetric}>
                                                <span className={styles.shiftLabel}>
                                                    End
                                                </span>

                                                <span className={styles.shiftValue}>
                                                    {formatShiftTime(shift.shiftEnd)}
                                                </span>
                                            </div>

                                            <div className={`${styles.shiftMetric} ${styles.durationMetric}`}>
                                                <span className={styles.shiftLabel}>
                                                    Duration
                                                </span>

                                                <span className={styles.shiftValue}>
                                                    {formatMinutesToHours(
                                                        shift.shiftDurationMinutes
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={styles.shiftDeleteButton}
                                            aria-label="Delete shift"
                                            onClick={() =>
                                                handleDeleteShift(shift.id)
                                            }
                                        >
                                            <LucideTrash size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.emptyState}>
                                    No shifts recorded.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={styles.addAnotherButton}
                            onClick={() => setIsAddShiftModalOpen(true)}
                        >
                            <LucidePlus size={19} />
                            Add another shift
                        </button>
                    </div>
                </>
            )}

            <div className={styles.statsBar}>
                <div className={styles.statCard}>
                <span className={styles.statLabel}>
                    Estimated salary
                </span>

                    <span className={styles.statValue}>
                    {((totalMinutes / 60) * hourlyRate).toFixed(2)} zł
                </span>
                </div>

                <div className={styles.statCard}>
                <span className={styles.statLabel}>
                    Worked time
                </span>

                    <span className={styles.statValue}>
                    {Math.floor(totalMinutes / 60)}h{" "}
                        {totalMinutes % 60}m
                </span>
                </div>
            </div>

            {isAddShiftModalOpen && (
                <AddShiftModal
                    onClose={() => {
                        setIsAddShiftModalOpen(false);
                        setSelectedDate(null);
                    }}
                    onSubmit={addShift}
                    selectedDate={
                        new Date(
                            currentYear,
                            currentMonth - 1,
                            selectedDate || 1
                        )
                    }
                />
            )}

            {isImportOpen && (
                <PasteShiftsModal
                    onClose={() => setIsImportOpen(false)}
                    onSubmit={handleManualImport}
                />
            )}
        </div>
    );
};

export default Me;
