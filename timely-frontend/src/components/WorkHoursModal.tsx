import {useEffect, useRef, useState} from "react";
import {ClipboardCopy, LucideCheck, LucideX} from "lucide-react";
import {Shift} from "../types/shifts.types";
import {useI18n} from "../i18n/I18nContext";
import {getWorkHoursRows} from "./workHours";
import styles from "./WorkHoursModal.module.css";

interface WorkHoursModalProps {
    shifts: Shift[];
    year: number;
    month: number;
    timeZone: string;
    onClose: () => void;
}

const WorkHoursModal = ({shifts, year, month, timeZone, onClose}: WorkHoursModalProps) => {
    const {locale, t} = useI18n();
    const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
    const closeRef = useRef<HTMLButtonElement>(null);
    const rows = getWorkHoursRows(shifts, year, month, timeZone, locale);
    const copyText = rows.map((row) => row.sundayHours
        ? `${row.text} [${t("includesSunday")}]`
        : row.text).join("\n");
    const monthLabel = new Intl.DateTimeFormat(locale, {month: "long", year: "numeric"})
        .format(new Date(year, month - 1, 1));

    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus();
        };
    }, [onClose]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copyText);
            setCopyState("copied");
        } catch {
            setCopyState("failed");
        }
    };

    return (
        <div className={styles.overlay} onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="work-hours-title">
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>{t("timesheet")}</span>
                        <h2 id="work-hours-title" className={styles.title}>{monthLabel}</h2>
                    </div>
                    <button ref={closeRef} type="button" className={styles.closeButton}
                            onClick={onClose} aria-label={t("closeTimesheet")}>
                        <LucideX size={20} />
                    </button>
                </div>

                <p className={styles.help}>{t("workHoursHelp", {timeZone})}</p>

                {rows.length ? (
                    <ol className={styles.list}>
                        {rows.map((row) => (
                            <li key={row.id} className={`${styles.row} ${row.sundayHours ? styles.sundayRow : ""}`}>
                                <span className={styles.date}>{row.date}</span>
                                <span className={styles.shiftDetails}>
                                    <span className={styles.time}>{row.timeRange}</span>
                                    <span className={styles.duration}>· {row.duration}</span>
                                </span>
                                <span className={styles.dayMeta}>
                                    <span className={styles.weekday}>{row.weekday}</span>
                                    {row.sundayHours && <span className={styles.sundayBadge}>
                                        {t("includesSunday")}
                                    </span>}
                                </span>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className={styles.empty}>{t("noWorkHours")}</p>
                )}

                {rows.length > 0 && (
                    <div className={styles.footer}>
                        <button type="button" className={styles.copyButton} onClick={handleCopy}>
                            {copyState === "copied" ? <LucideCheck size={18} /> : <ClipboardCopy size={18} />}
                            {copyState === "copied" ? t("workHoursCopied") : t("copyWorkHours")}
                        </button>
                        {copyState === "failed" && <div className={styles.copyFallback}>
                            <label htmlFor="work-hours-copy-text" className={styles.copyError}>
                                {t("workHoursCopyFailed")}
                            </label>
                            <textarea id="work-hours-copy-text" readOnly autoFocus value={copyText}
                                      rows={Math.min(rows.length, 6)} onFocus={(event) => event.currentTarget.select()} />
                        </div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkHoursModal;
