import styles from "./ShiftsTable.module.css";
import { ShiftData } from "../../types/shifts.types";

interface ShiftsTableProps {
  shifts: ShiftData[];
  onDelete: (id: number) => void; // New prop for delete handler
}

const ShiftsTable = ({ shifts, onDelete }: ShiftsTableProps) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Hours</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {shifts.length > 0 ? (
            shifts.map((shift, index) => (
              <tr key={index}>
                <td>{new Date(shift.shiftStart).toLocaleString()}</td>
                <td>{new Date(shift.shiftEnd).toLocaleString()}</td>
                <td>{shift.shiftDurationMinutes}</td>
                <td>
                  <button 
                    className="button buttonDestructive" 
                    onClick={() => onDelete(shift.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className={styles.noData}>
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
