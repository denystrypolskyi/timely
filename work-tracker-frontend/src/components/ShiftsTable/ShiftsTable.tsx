import styles from "./ShiftsTable.module.css";
import { ShiftData } from "../../types/shifts.types";

interface ShiftsTableProps {
  hours: ShiftData[];
}

const ShiftsTable = ({ hours }: ShiftsTableProps) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        {/* <thead>
          <tr>
            <th style={{ textAlign: "center" }} colSpan={3}>
              February
            </th>
          </tr>
        </thead> */}
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {hours.length > 0 ? (
            hours.map((hour, index) => (
              <tr key={index}>
                <td>{new Date(hour.shiftStart).toLocaleString()}</td>
                <td>{new Date(hour.shiftEnd).toLocaleString()}</td>
                <td>{hour.shiftDurationMinutes}</td>
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

export default ShiftsTable;
