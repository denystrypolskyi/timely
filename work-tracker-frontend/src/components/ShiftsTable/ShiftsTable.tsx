import { useState } from "react";
import styles from "./ShiftsTable.module.css";
import { ShiftData } from "../../types/shifts.types";

interface ShiftsTableProps {
  shifts: ShiftData[];
  onDelete: (id: number) => void;
}

const ShiftsTable = ({ shifts, onDelete }: ShiftsTableProps) => {
  const [deletingShiftIds, setDeletingShiftIds] = useState<number[]>([]);

  const handleDelete = (id: number) => {
    setDeletingShiftIds((prev) => [...prev, id]);
    onDelete(id);
    setDeletingShiftIds((prev) => prev.filter((shiftId) => shiftId !== id));
  };

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
                    onClick={() => handleDelete(shift.id)}
                    disabled={deletingShiftIds.includes(shift.id)}
                  >
                    {deletingShiftIds.includes(shift.id)
                      ? "Deleting..."
                      : "Delete"}
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
