import {useState} from "react";
import styles from "./SettingsModal.module.css";
import {LucideCheck, LucideSettings, LucideSquarePen, LucideX} from "lucide-react";

interface SettingsModalProps {
    onClose: () => void;
    onSave: (newRate: number) => void;
    hourlyRate: number;
    onEditClick: () => void;
    isEditable: boolean;
}

const SettingsModal = ({
                           onClose,
                           hourlyRate,
                           onSave,
                           onEditClick,
                           isEditable,
                       }: SettingsModalProps) => {
    const [newHourlyRate, setNewHourlyRate] = useState<number>(hourlyRate);

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewHourlyRate(Number(e.target.value));
    };

    const handleSave = () => {
        onSave(newHourlyRate);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>
                            Preferences
                        </span>

                        <h2 className={styles.title}>
                            Settings
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close settings modal"
                    >
                        <LucideX size={20}/>
                    </button>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryIcon}>
                        <LucideSettings size={20}/>
                    </div>

                    <div>
                        <p className={styles.summaryTitle}>
                            Salary estimate
                        </p>

                        <p className={styles.summaryText}>
                            Your hourly rate is used to calculate the monthly estimate.
                        </p>
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <label
                        htmlFor="hourlyRate"
                        className={styles.label}
                    >
                        Hourly rate
                    </label>

                    <div className={styles.rateControl}>
                        <input
                            type="number"
                            id="hourlyRate"
                            value={newHourlyRate}
                            onChange={handleRateChange}
                            disabled={!isEditable}
                            className={styles.hourlyRateInput}
                            min="0"
                            step="0.01"
                        />

                        <span className={styles.currency}>
                            zł/h
                        </span>

                        <button
                            type="button"
                            onClick={!isEditable ? onEditClick : handleSave}
                            className={styles.editButton}
                            aria-label={!isEditable ? "Edit hourly rate" : "Save hourly rate"}
                        >
                            {!isEditable ? <LucideSquarePen size={18}/> : <LucideCheck size={18}/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
