import { useEffect, useState } from "react";
import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";
import hoursService from "../../services/hours.service";
import { hoursData } from "../../types/hours.types";
import HoursTable from "../HoursTable/HoursTable";
import AddHoursModal from "../AddHoursModal/AddHoursModal";

function Me() {
  const { logout } = useMe();
  const [hours, setHours] = useState<hoursData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const data = await hoursService.getWorkHours();
        const newData = data.map((record) => {
          const totalMinutes = parseInt(record.workedHours);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          return {
            id: record.id,
            shiftStart: record.shiftStart,
            shiftEnd: record.shiftEnd,
            user: record.user,
            workedHours: `${hours}h ${minutes}m`,
          };
        });

        setHours(newData);
      } catch (error) {
        console.error("Error fetching work hours:", error);
      }
    };
    fetchHours();
  }, []);

  const handleAddHours = async (newRecord: {
    shiftStart: string;
    shiftEnd: string;
  }) => {
    try {
      const addedHour = await hoursService.addWorkHours(newRecord);

      const totalMinutes = parseInt(addedHour.workedHours);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const formattedAddedHour = {
        ...addedHour,
        workedHours: `${hours}h ${minutes}m`,
      };

      setHours((prev) => [...prev, formattedAddedHour]);
    } catch (error) {
      console.error("Failed to add work hours:", error);
    }
  };

  return (
    <div className={`container ${styles.meContainer}`}>
      <HoursTable hours={hours} />
      <div className={styles.buttonContainer}>
        <button
          className="secondaryButton"
          onClick={() => setIsModalOpen(true)}
        >
          Add
        </button>
        <button
          className={`button buttonDestructive ${styles.logoutButton}`}
          onClick={logout}
        >
          Logout
        </button>
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
