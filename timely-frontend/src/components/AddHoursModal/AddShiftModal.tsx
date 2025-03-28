import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./AddShiftModal.module.css";
import { format } from "date-fns";

interface AddShiftModalProps {
  onClose: () => void;
  onSubmit: (data: { shiftStart: string; shiftEnd: string }) => void;
  selectedDate: Date;
}

const AddShiftModal = ({
  onClose,
  onSubmit,
  selectedDate,
}: AddShiftModalProps) => {
  const [shiftStart, setShiftStart] = useState<Date | null>(selectedDate);
  const [shiftEnd, setShiftEnd] = useState<Date | null>(selectedDate);
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
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            position: "relative",
            justifyContent: "space-between",
          }}
        >
          <h2>✍️ New Shift</h2>
          <img
            style={{ position: "absolute", right: "0" }}
            className={`${styles.closeButton}`}
            src="/close.svg"
            onClick={onClose}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="shiftStart">🕒 From:</label>
          <DatePicker
            id="shiftStart"
            selected={shiftStart}
            onChange={(date) => {
              setShiftStart(date);
              setShiftEnd(date);
            }}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="dd.MM.yyyy HH:mm"
          />

          <label htmlFor="shiftEnd" style={{ marginTop: "10px" }}>
            🕒 Till:
          </label>
          <DatePicker
            id="shiftEnd"
            selected={shiftEnd}
            onChange={(date) => setShiftEnd(date)}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="dd.MM.yyyy HH:mm"
          />

          {error && (
            <p className={`error`} style={{ textAlign: "start" }}>
              {error}
            </p>
          )}
            <button
              type="submit"
              className={`button ${styles.modalButton}`}
            >
              Confirm
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddShiftModal;
