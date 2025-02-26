import styles from "./HoursTable.module.css";
import { hoursData } from "../../types/hours.types";

interface HoursTableProps {
  hours: hoursData[];
}

const HoursTable = ({ hours }: HoursTableProps) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {hours.length > 0 ? (
            hours.map((hour, index) => (
              <tr key={index}>
                <td>{new Date(hour.shiftStart).toLocaleString()}</td>
                <td>{new Date(hour.shiftEnd).toLocaleString()}</td>
                <td>{hour.workedHours}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className={styles.noData}>
                No records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HoursTable;
