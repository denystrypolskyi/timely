import { useState } from "react";
import styles from "./AddHoursModal.module.css";

interface AddHoursModalProps {
  onClose: () => void;
  onSubmit: (data: { shiftStart: string; shiftEnd: string }) => void;
}

const AddHoursModal = ({ onClose, onSubmit }: AddHoursModalProps) => {
  const [shiftStart, setStartShift] = useState("");
  const [shiftEnd, setEndShift] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(shiftEnd) < new Date(shiftStart)) {
      setError("Shift end cannot be earlier than shift start");
      return;
    }

    setError("");
    onSubmit({ shiftStart, shiftEnd });
    onClose();
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartShift(e.target.value);
  };
  
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndShift(e.target.value);
  };
  

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit}>
          <label>
            Shift Start:
            <input
              type="datetime-local"
              value={shiftStart}
              onChange={handleStartChange}
              required
            />
          </label>
          <label>
            Shift End:
            <input
              type="datetime-local"
              value={shiftEnd}
              onChange={handleEndChange}
              required
            />
          </label>
          {error && <p className={`error`}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`button secondaryButton ${styles.modalButton}`}
              style={{ marginRight: "8px" }}
            >
              Confirm
            </button>
            <button
              type="button"
              className={`button ${styles.modalButton}`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoursModal;
