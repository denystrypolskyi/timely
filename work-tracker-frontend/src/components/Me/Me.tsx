import { useEffect, useState } from "react";
import { useMe } from "../../hooks/useMe";
import styles from "./Me.module.css";
import hoursService from "../../services/hours.service";
import { hoursData } from "../../types/hours.types";
import HoursTable from "../HoursTable/HoursTable"; 

function Me() {
  const { logout } = useMe();
  const [hours, setHours] = useState<hoursData[]>([]);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const data = await hoursService.getWorkHours();
        setHours(data);
      } catch (error) {
        console.error("Error fetching work hours:", error);
      }
    };
    fetchHours();
  }, []);

  return (
    <div className={`container ${styles.meContainer}`}>
      <HoursTable hours={hours} />
      <button className={`secondaryButton ${styles.logoutButton}`} onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Me;
