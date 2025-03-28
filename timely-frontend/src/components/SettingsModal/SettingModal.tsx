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
        <h2>⚙️ Settings</h2>
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
        <button
          className="button secondaryButton"
          onClick={onClose}
          style={{ marginTop: "16px", padding: "8px 16px" }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
