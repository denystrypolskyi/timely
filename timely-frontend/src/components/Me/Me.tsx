import {useState, useRef, useEffect} from "react";
import {useShifts} from "../../hooks/useShifts";
import {useAuth} from "../../hooks/useAuth";
import {useHourlyRate} from "../../hooks/useHourlyRate";
import styles from "./Me.module.css";
import AddShiftModal from "../AddHoursModal/AddShiftModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import SettingsModal from "../SettingsModal/SettingsModal";
import PasteShiftsModal from "../ImportShiftsModal/PasteShiftsModal.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

import {
    ClipboardPaste,
    LucideArrowLeft,
    LucideArrowRight,
    LucideLogOut,
    LucideSettings, LucideTrash
} from "lucide-react";

import {
    formatMinutesToHours,
    getDaysInMonth,
    getShiftsForSelectedDate,
    isShiftOverlapping,
    parseShiftsFromText
} from "../../utils/utils.ts";

const formatShiftTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

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
        event: React.MouseEvent<HTMLDivElement>,
        day: number
    ) => {
        setSelectedDate(day);

        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
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
            {error && <p>Error fetching work hours</p>}

            <div className={styles.calendarBar}>
                <div className={styles.controlsGroup}>
                    <button
                        className={styles.iconButton}
                        onClick={handlePreviousMonth}
                    >
                        <LucideArrowLeft size={20} />
                    </button>

                    <div className={styles.monthDisplay}>
                        {new Date(currentYear, currentMonth - 1).toLocaleString(
                            "default",
                            {
                                month: "long",
                            }
                        )}
                        , {currentYear}
                    </div>

                    <button
                        className={styles.iconButton}
                        onClick={handleNextMonth}
                    >
                        <LucideArrowRight size={20} />
                    </button>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setIsImportOpen(true)}
                    >
                        <ClipboardPaste size={20} />
                    </button>

                    <button
                        className={styles.iconButton}
                        onClick={toggleSettings}
                    >
                        <LucideSettings size={20} />
                    </button>

                    <button
                        className={`${styles.iconButton} ${styles.dangerButton}`}
                        onClick={logout}
                    >
                        <LucideLogOut size={20} />
                    </button>
                </div>
            </div>

            {isImportOpen && (
                <PasteShiftsModal
                    onClose={() => setIsImportOpen(false)}
                    onSubmit={handleManualImport}
                />
            )}

            <div className={styles.calendarContainer}>
                {Array.from(
                    {length: getDaysInMonth(currentYear, currentMonth)},
                    (_, i) => {
                        const day = i + 1;

                        const hasShift = shifts.some(
                            (shift) =>
                                new Date(shift.shiftStart).getDate() === day
                        );

                        return (
                            <div
                                key={day}
                                className={`
                                ${styles.calendarDay}
                                ${
                                    hasShift
                                        ? styles.dayWithShift
                                        : styles.dayEmpty
                                }
                                ${
                                    selectedDate === day
                                        ? styles.selected
                                        : ""
                                }
                            `}
                                onClick={(event) => {
                                    handleDayClick(event, day);

                                    if (hasShift) {
                                        setSelectedDate(day);
                                    } else {
                                        setIsAddShiftModalOpen(true);
                                    }
                                }}
                            >
                                {day}
                            </div>
                        );
                    }
                )}
            </div>

            {isSettingsOpen && (
                <SettingsModal
                    onClose={toggleSettings}
                    onSave={handleSaveHourlyRate}
                    hourlyRate={hourlyRate}
                    onEditClick={handleEditClick}
                    isEditable={isEditable}
                />
            )}

            {selectedDate && !isAddShiftModalOpen && (
                <div
                    ref={dropdownRef}
                    className={styles.dropdown}
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                    }}
                >
                    <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownEyebrow}>
                            Selected shift day
                        </span>

                        <h3 className={styles.dropdownTitle}>
                            {new Date(
                                currentYear,
                                currentMonth - 1,
                                selectedDate
                            ).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </h3>
                    </div>

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
        </div>
    );
};

export default Me;
