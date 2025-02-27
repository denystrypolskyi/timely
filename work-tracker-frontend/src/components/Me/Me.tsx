import { useState } from "react";
import { useShifts } from "../../hooks/useShifts";
import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";
import ShiftsTable from "../ShiftsTable/ShiftsTable";
import AddHoursModal from "../AddHoursModal/AddHoursModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

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
  const { logout } = useMe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hourlyRate = 30.5;

  const handleAddShift = async (newRecord: {
    shiftStart: string;
    shiftEnd: string;
  }) => {
    try {
      await addShift(newRecord);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add shift:", err);
    }
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`container ${styles.meContainer}`}>
      {error && <p className="error">Error fetching work hours</p>}
      <div className={`${styles.tablePanel}`}>
        <div style={{ display: "flex", gap: "16px" }}>
          <button className="button" onClick={handlePreviousMonth}>
            Previous
          </button>
          <button className="button" onClick={handleNextMonth}>
            Next
          </button>
          <span className="button outlineButton" style={{ cursor: "default" }}>
            {new Date(currentYear, currentMonth - 1).toLocaleString("default", {
              month: "long",
            })}
          </span>
        </div>
        <a onClick={logout}>Switch Account</a>
      </div>

      <ShiftsTable shifts={shifts} onDelete={handleDeleteShift} />
      <div className={styles.tablePanel}>
        <button className="button" onClick={() => setIsModalOpen(true)}>
          Add
        </button>
        <div className={styles.statsContainer}>
          <div className={`button outlineButton`} style={{ cursor: "default" }}>
            <span>{((totalMinutes / 60) * hourlyRate).toFixed(2)}zł</span>
          </div>
          <div className={`button outlineButton`} style={{ cursor: "default" }}>
            <span>
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddHoursModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddShift}
        />
      )}
    </div>
  );
};

export default Me;
