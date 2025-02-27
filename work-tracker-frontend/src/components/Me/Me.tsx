import { useState, useRef, useEffect } from "react";
import { useShifts } from "../../hooks/useShifts";
import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";
import AddShiftModal from "../AddHoursModal/AddShiftModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const hourlyRate = 30.5;

  const getShiftsForSelectedDate = () => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.shiftStart).getDate();
      return shiftDate === selectedDate;
    });
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
    event: React.MouseEvent<HTMLDivElement>,
    day: number
  ) => {
    setSelectedDate(day);

    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setSelectedDate(null);
      // setIsModalOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`container ${styles.meContainer}`}>
      {error && <p className="error">Error fetching work hours</p>}
      <div className={`${styles.calendarBar}`}>
        <button className="button" onClick={handlePreviousMonth}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="button outlineButton" style={{ cursor: "default" }}>
          {new Date(currentYear, currentMonth - 1).toLocaleString("default", {
            month: "long",
          })}
        </div>
        <button className="button" onClick={handleNextMonth}>
          <i className="fas fa-arrow-right"></i>
        </button>
        <button className="button" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Calendar */}
      <div className={styles.calendarContainer}>
        {Array.from(
          { length: getDaysInMonth(currentYear, currentMonth) },
          (_, i) => {
            const day = i + 1;
            const hasShift = shifts.some(
              (shift) => new Date(shift.shiftStart).getDate() === day
            );

            return (
              <div
                key={day}
                className={`${styles.calendarDay} ${
                  selectedDate === day ? styles.selected : ""
                }`}
                onClick={(event) => {
                  console.log(hasShift, day);

                  handleDayClick(event, day);
                  if (hasShift) {
                    setSelectedDate(day);
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                style={{
                  backgroundColor: hasShift ? "lightgreen" : "black",
                  transition: "background-color 0.2s ease-in-out",
                  ...(hoveredDate === day && {
                    backgroundColor: hasShift ? "green" : "#333",
                  }),
                }}
              >
                {day}
              </div>
            );
          }
        )}
      </div>

      {/* Dropdown Popup */}
      {selectedDate && !isModalOpen && (
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          <p>
            📅 Selected Day: {selectedDate}/{currentMonth}/{currentYear}
          </p>
          {getShiftsForSelectedDate().length > 0 ? (
            getShiftsForSelectedDate().map((shift) => (
              <div key={shift.id} className={styles.shiftInfo}>
                <p>
                  🕒 Start: {new Date(shift.shiftStart).toLocaleTimeString()}
                </p>
                <p>🕒 End: {new Date(shift.shiftEnd).toLocaleTimeString()}</p>
                <p>⏳ Duration: {shift.shiftDurationMinutes}</p>
                <button
                  className="button"
                  onClick={() => deleteShift(shift.id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))
          ) : (
            <p>🔍 No shifts recorded for this day.</p>
          )}
        </div>
      )}

      <div className={`${styles.calendarBar}`}>
        <div className={`button outlineButton`} style={{ cursor: "default" }}>
          <div>{((totalMinutes / 60) * hourlyRate).toFixed(2)}zł</div>
        </div>
        <div className={`button outlineButton`} style={{ cursor: "default" }}>
          <div>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddShiftModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          onSubmit={addShift}
          selectedDate={
            new Date(currentYear, currentMonth - 1, selectedDate || 1)
          }
        />
      )}
    </div>
  );
};

export default Me;
