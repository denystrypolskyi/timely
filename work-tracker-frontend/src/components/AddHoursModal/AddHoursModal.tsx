import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./AddHoursModal.module.css";
import { format } from "date-fns";

interface AddHoursModalProps {
  onClose: () => void;
  onSubmit: (data: { shiftStart: string; shiftEnd: string }) => void;
}

const AddHoursModal = ({ onClose, onSubmit }: AddHoursModalProps) => {
  const [shiftStart, setShiftStart] = useState<Date | null>(new Date());
  const [shiftEnd, setShiftEnd] = useState<Date | null>(new Date());
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shiftStart || !shiftEnd) {
      setError("Both shift start and end times are required.");
      return;
    }

    if (shiftEnd < shiftStart) {
      setError("Shift end cannot be earlier than shift start");
      return;
    }

    setError("");
    onSubmit({
      shiftStart: format(shiftStart, "dd.MM.yyyy HH:mm"),
      shiftEnd: format(shiftEnd, "dd.MM.yyyy HH:mm"),
    });

    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit}>
          <label>Start Time:</label>
          <DatePicker
            selected={shiftStart}
            onChange={(date) => setShiftStart(date)}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="dd.MM.yyyy HH:mm"
          />

          <label style={{ marginTop: "10px" }}>End Time:</label>
          <DatePicker
            selected={shiftEnd}
            onChange={(date) => setShiftEnd(date)}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="dd.MM.yyyy HH:mm"
          />

          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`button ${styles.modalButton}`}
              style={{ marginRight: "8px" }}
            >
              Confirm
            </button>
            <button
              type="button"
              className={`button secondaryButton ${styles.modalButton}`}
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
