import { useState } from "react";
import { useHours } from "../../hooks/useHours";
import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";
import HoursTable from "../HoursTable/HoursTable";
import AddHoursModal from "../AddHoursModal/AddHoursModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const Me = () => {
  const { hours, totalMinutes, isLoading, error, addHours, setMonth, currentYear, currentMonth } = useHours();
  const { logout } = useMe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hourlyRate = 30.5;

  const handleAddHours = async (newRecord: { shiftStart: string; shiftEnd: string; }) => {
    try {
      await addHours(newRecord);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add work hours:", err);
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
          <button className="button" onClick={handlePreviousMonth}>Previous</button>
          <button className="button" onClick={handleNextMonth}>Next</button>
          <span className="button outlineButton" style={{ cursor: "default" }}>
            {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}
          </span>
        </div>
        <button className={`button buttonDestructive`} onClick={logout}>
          Logout
        </button>
      </div>

      <HoursTable hours={hours} />
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
          onSubmit={handleAddHours}
        />
      )}
    </div>
  );
};

export default Me;
