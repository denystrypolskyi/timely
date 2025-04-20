import { useState } from "react";
import styles from "./SettingsModal.module.css";

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
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            position: "relative",
            justifyContent: "space-between",
          }}
        >
          <h2>⚙️ Settings</h2>
          <img
            style={{ position: "absolute", right: "0" }}
            className={`${styles.closeButton}`}
            src="/close.svg"
            onClick={onClose}
          />
        </div>
        <div>
          <label htmlFor="hourlyRate">💰 Hourly Rate:</label>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="number"
              id="hourlyRate"
              value={newHourlyRate}
              onChange={handleRateChange}
              disabled={!isEditable}
              className={styles.hourlyRateInput}
            />
            <img
              src={`${!isEditable ? "/edit-button.svg" : "/accept.svg"}`}
              className={`${styles.editButton}`}
              onClick={!isEditable ? onEditClick : handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
