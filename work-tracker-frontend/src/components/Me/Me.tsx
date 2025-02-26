import { useState } from "react";
import { useMe } from "../../hooks/useMe";
import { useHours } from "../../hooks/useHours";
import styles from "./Me.module.css";
import HoursTable from "../HoursTable/HoursTable";
import AddHoursModal from "../AddHoursModal/AddHoursModal";
import TopBar from "../TopBar/TopBar";
import { ClipLoader } from "react-spinners";

function Me() {
  const { logout } = useMe();
  const { hours, totalMinutes, isLoading, error, addHours } = useHours();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hourlyRate = 30.5;

  const handleAddHours = async (newRecord: {
    shiftStart: string;
    shiftEnd: string;
  }) => {
    try {
      await addHours(newRecord);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add work hours:", err);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader size={20} color="#fff" />
      </div>
    );
  }

  return (
    <div className={`container ${styles.meContainer}`}>
      {error && <p className="error">Error fetching work hours</p>}
      <TopBar
        totalMinutes={totalMinutes}
        hourlyRate={hourlyRate}
        onLogout={logout}
      />
      <HoursTable hours={hours} />
      <div className={styles.tableBottomPanel}>
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
}

export default Me;
