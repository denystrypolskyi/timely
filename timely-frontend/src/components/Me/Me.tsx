import {useState, useRef, useEffect} from "react";
import {useShifts} from "../../hooks/useShifts";
import {useAuth} from "../../hooks/useAuth";
import {useHourlyRate} from "../../hooks/useHourlyRate";
import styles from "./Me.module.css";
import AddShiftModal from "@/components/AddShiftModal/AddShiftModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import SettingsModal from "../SettingsModal/SettingsModal";
import PasteShiftsModal from "@/components/PasteShiftsModal/PasteShiftsModal.tsx";
import CreateUserModal from "../CreateUserModal/CreateUserModal";
import {useI18n} from "../../i18n/I18nContext";

import {
    ClipboardPaste,
    LucideArrowLeft,
    LucideArrowRight,
    LucideClock,
    LucideLogOut,
    LucidePlus,
    LucideSettings,
    LucideTrash,
    LucideUserPlus,
    LucideX,
} from "lucide-react";

import {
    formatMinutesToHours,
    getDaysInMonth,
    getShiftsForSelectedDate,
    isShiftOverlapping,
    parseShiftsFromText
} from "../../utils/utils.ts";

const formatShiftTime = (date: string, locale: string) =>
    new Date(date).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });

const Me = () => {
    const {locale, t} = useI18n();
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
    const {user, logout} = useAuth();
    const {hourlyRate, updateHourlyRate, currency, updateCurrency} = useHourlyRate();
    const [isAddShiftModalOpen, setIsAddShiftModalOpen] =
        useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});
    const [isImportOpen, setIsImportOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

    const isAdmin = user?.role === "ADMIN";

    const selectedDateShifts = getShiftsForSelectedDate(shifts, selectedDate);
    const monthDate = new Date(currentYear, currentMonth - 1);
    const monthLabel = monthDate.toLocaleString(locale, {
        month: "long",
        year: "numeric",
    });
    const leadingDays = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;
    const weekdays = Array.from({length: 7}, (_, index) => {
        const monday = new Date(2024, 0, 1 + index);
        return new Intl.DateTimeFormat(locale, {weekday: "short"}).format(monday);
    });

    const handleSaveHourlyRate = (newRate: number) => {
        updateHourlyRate(newRate);
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
            currentYear,
            {
                invalidLine: (line, value) => t("invalidImportLine", {line, value}),
                endAfterStart: (line) => t("importEndAfterStart", {line}),
            }
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
            const dropdown = dropdownRef.current;

            if (!dropdown || dropdown.contains(event.target as Node)) {
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
                <nav
                    className={`${styles.actions} ${isAdmin ? styles.adminActions : ""}`}
                    aria-label={t("accountActions")}
                >
                    {isAdmin && (
                        <button
                            type="button"
                            className={`${styles.iconButton} ${styles.actionButton} ${styles.adminButton}`}
                            onClick={() => setIsCreateUserOpen(true)}
                            aria-label={t("createUserAccount")}
                            title={t("createUserAccount")}
                        >
                            <LucideUserPlus size={20}/>
                            <span className={styles.actionLabel}>{t("access")}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.actionButton}`}
                        onClick={() => setIsImportOpen(true)}
                        aria-label={t("importShifts")}
                        title={t("importShifts")}
                    >
                        <ClipboardPaste size={20} />
                        <span className={styles.actionLabel}>{t("import")}</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.actionButton}`}
                        onClick={toggleSettings}
                        aria-label={t("openSettings")}
                        title={t("settings")}
                    >
                        <LucideSettings size={20} />
                        <span className={styles.actionLabel}>{t("settings")}</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.actionButton} ${styles.dangerButton}`}
                        onClick={() => logout()}
                        aria-label={t("logOut")}
                        title={t("logOut")}
                    >
                        <LucideLogOut size={20} />
                        <span className={styles.actionLabel}>{t("logOut")}</span>
                    </button>
                </nav>
            </header>

            {error && (
                <p className={styles.errorBanner} role="alert">
                    {t("loadShiftsError")}
                </p>
            )}

            <section className={styles.monthSection} aria-labelledby="month-heading">
                <div className={styles.calendarBar}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={handlePreviousMonth}
                        aria-label={t("previousMonth")}
                    >
                        <LucideArrowLeft size={21} />
                    </button>

                    <div className={styles.monthCopy}>
                        <span className={styles.monthEyebrow}>{t("yourSchedule")}</span>
                        <h1 id="month-heading" className={styles.monthDisplay}>
                            {monthLabel}
                        </h1>
                    </div>

                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={handleNextMonth}
                        aria-label={t("nextMonth")}
                    >
                        <LucideArrowRight size={21} />
                    </button>
                </div>

                <div className={styles.calendarCard}>
                    <div className={styles.weekdays} aria-hidden="true">
                        {weekdays.map((weekday) => (
                            <span key={weekday}>{weekday}</span>
                        ))}
                    </div>

                    <div
                        className={styles.calendarContainer}
                        role="grid"
                        aria-label={t("calendar", {month: monthLabel})}
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
                                const dateLabel = date.toLocaleDateString(locale, {
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
                                                ? t(
                                                    dayShifts.length === 1
                                                        ? "shiftRecordedCount"
                                                        : "shiftsRecordedCount",
                                                    {count: dayShifts.length}
                                                )
                                                : t("noShiftDay")
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
                        <span><i className={styles.legendDot} /> {t("shiftRecorded")}</span>
                        <span>{t("tapDay")}</span>
                    </div>
                </div>
            </section>

            {isSettingsOpen && (
                <SettingsModal
                    onClose={toggleSettings}
                    onSave={handleSaveHourlyRate}
                    hourlyRate={hourlyRate}
                    currency={currency}
                    onCurrencyChange={updateCurrency}
                />
            )}

            {isAdmin && isCreateUserOpen && (
                <CreateUserModal onClose={() => setIsCreateUserOpen(false)}/>
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
                                    {t("selectedDay")}
                                </span>

                                <h2 id="selected-day-title" className={styles.dropdownTitle}>
                                    {new Date(
                                        currentYear,
                                        currentMonth - 1,
                                        selectedDate
                                    ).toLocaleDateString(locale, {
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
                                aria-label={t("closeShiftDetails")}
                            >
                                <LucideX size={20} />
                            </button>
                        </div>

                        <div className={styles.shiftList}>
                            {selectedDateShifts.length > 0 ? (
                                selectedDateShifts.map((shift) => {
                                    const shiftStart = new Date(shift.shiftStart);
                                    const shiftEnd = new Date(shift.shiftEnd);
                                    const endsOnAnotherDay =
                                        shiftStart.getFullYear() !== shiftEnd.getFullYear() ||
                                        shiftStart.getMonth() !== shiftEnd.getMonth() ||
                                        shiftStart.getDate() !== shiftEnd.getDate();

                                    return (
                                        <article
                                            key={shift.id}
                                            className={styles.shiftInfo}
                                        >
                                            <div className={styles.shiftTimeline}>
                                                <div className={styles.shiftTimePoint}>
                                                    <span className={styles.shiftLabel}>
                                                        {t("start")}
                                                    </span>

                                                    <time
                                                        className={styles.shiftValue}
                                                        dateTime={shift.shiftStart}
                                                    >
                                                        {formatShiftTime(shift.shiftStart, locale)}
                                                    </time>
                                                </div>

                                                <div
                                                    className={styles.shiftConnector}
                                                    aria-hidden="true"
                                                >
                                                    <span />
                                                    <LucideArrowRight size={16} />
                                                </div>

                                                <div className={`${styles.shiftTimePoint} ${styles.endTimePoint}`}>
                                                    <span className={styles.shiftLabel}>
                                                        {t("end")}
                                                    </span>

                                                    <time
                                                        className={styles.shiftValue}
                                                        dateTime={shift.shiftEnd}
                                                    >
                                                        {formatShiftTime(shift.shiftEnd, locale)}
                                                    </time>
                                                </div>
                                            </div>

                                            <div className={styles.shiftFooter}>
                                                <div className={styles.durationSummary}>
                                                    <span className={styles.durationIcon}>
                                                        <LucideClock size={15} aria-hidden="true" />
                                                    </span>

                                                    <span>
                                                        <span className={styles.durationLabel}>
                                                            {t("duration")}
                                                        </span>
                                                        <strong>
                                                            {formatMinutesToHours(
                                                                shift.shiftDurationMinutes,
                                                                t("hoursShort"),
                                                                t("minutesShort")
                                                            )}
                                                        </strong>
                                                    </span>
                                                </div>

                                                {endsOnAnotherDay && (
                                                    <span className={styles.nextDayBadge}>
                                                        {t("nextDay")} ·{" "}
                                                        {shiftEnd.toLocaleDateString(locale, {
                                                            day: "numeric",
                                                            month: "short",
                                                        })}
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    className={styles.shiftDeleteButton}
                                                    aria-label={t("deleteShift")}
                                                    title={t("deleteShift")}
                                                    onClick={() =>
                                                        handleDeleteShift(shift.id)
                                                    }
                                                >
                                                    <LucideTrash size={17} />
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <p className={styles.emptyState}>
                                    {t("noShiftsRecorded")}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={styles.addAnotherButton}
                            onClick={() => setIsAddShiftModalOpen(true)}
                        >
                            <LucidePlus size={19} />
                            {t("addAnotherShift")}
                        </button>
                    </div>
                </>
            )}

            <div className={styles.statsBar}>
                <div className={styles.statCard}>
                <span className={styles.statLabel}>
                    {t("estimatedSalary")}
                </span>

                    <span className={styles.statValue}>
                    {new Intl.NumberFormat(locale, {
                        style: "currency",
                        currency,
                    }).format((totalMinutes / 60) * hourlyRate)}
                </span>
                </div>

                <div className={styles.statCard}>
                <span className={styles.statLabel}>
                    {t("workedTime")}
                </span>

                    <span className={styles.statValue}>
                    {Math.floor(totalMinutes / 60)}{t("hoursShort")}{" "}
                        {totalMinutes % 60}{t("minutesShort")}
                </span>
                </div>
            </div>

            {isAddShiftModalOpen && selectedDate !== null && (
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
                            selectedDate
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
