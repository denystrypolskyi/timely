import { useState, useRef, useEffect } from "react";
import { useShifts } from "../../hooks/useShifts";
import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";
import AddShiftModal from "../AddHoursModal/AddShiftModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import SettingsModal from "../SettingsModal/SettingModal";
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
  const { logout, hourlyRate, updateHourlyRate } = useMe();
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] =
    useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleSaveHourlyRate = (newRate: number) => {
    updateHourlyRate(newRate);
    setIsEditable(false);
  };

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

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
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="button" onClick={handlePreviousMonth}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="button outlineButton" style={{ cursor: "default" }}>
            {new Date(currentYear, currentMonth - 1).toLocaleString("default", {
              month: "long",
            })}, {currentYear}
          </div>
          <button className="button" onClick={handleNextMonth}>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div
          style={{
            flexDirection: "row",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/settings.svg"
            alt="Settings"
            className={styles.settingsButton}
            onClick={toggleSettings}
          />
          <img
            src="/exit.svg"
            alt="Exit"
            className={styles.exitButton}
            onClick={logout}
          />
        </div>
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
                  handleDayClick(event, day);
                  if (hasShift) {
                    setSelectedDate(day);
                  } else {
                    setIsAddShiftModalOpen(true);
                  }
                }}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                style={{
                  backgroundColor: hasShift ? "#008b8b" : "black",
                  transition: "background-color 0.2s ease-in-out",
                  ...(hoveredDate === day && {
                    backgroundColor: hasShift ? "#007a99" : "#333",
                  }),
                }}
              >
                {day}
              </div>
            );
          }
        )}
      </div>

      {/* Settings Popup */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={toggleSettings}
          onSave={handleSaveHourlyRate}
          hourlyRate={hourlyRate}
          onEditClick={handleEditClick}
          isEditable={isEditable}
        />
      )}

      {/* Selected Date Info Popup */}
      {selectedDate && !isAddShiftModalOpen && (
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
                  🕒 From: {new Date(shift.shiftStart).toLocaleTimeString()}
                </p>
                <p>🕒 Till: {new Date(shift.shiftEnd).toLocaleTimeString()}</p>
                <p>⏳ Duration: {shift.shiftDurationMinutes}</p>
                <button
                  className="button"
                  onClick={() => handleDeleteShift(shift.id)}
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

      {isAddShiftModalOpen && (
        <AddShiftModal
          onClose={() => {
            setIsAddShiftModalOpen(false);
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
