import {Shift} from "../types/shifts.types.ts";

export const formatMinutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

export const isShiftOverlapping = (
    newShiftStart: Date,
    newShiftEnd: Date,
    existingShifts: { shiftStart: string; shiftEnd: string }[]
) => {
  return existingShifts.some((shift) => {
    const start = new Date(shift.shiftStart);
    const end = new Date(shift.shiftEnd);
    return newShiftStart < end && newShiftEnd > start;
  });
};

export const parseShiftsFromText = (
    text: string,
    year: number
) => {
  const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  return lines.map((line, index) => {
    const match = line.match(
        /^(\d{2})\.(\d{2})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/
    );

    if (!match) {
      throw new Error(
          `Invalid format at line ${index + 1}: "${line}"`
      );
    }

    const [, day, month, startTime, endTime] = match;

    const [startHour, startMinute] = startTime
        .split(":")
        .map(Number);

    const [endHour, endMinute] = endTime
        .split(":")
        .map(Number);

    const shiftStart = new Date(
        year,
        Number(month) - 1,
        Number(day),
        startHour,
        startMinute
    );

    const shiftEnd = new Date(
        year,
        Number(month) - 1,
        Number(day),
        endHour,
        endMinute
    );

    if (shiftEnd <= shiftStart) {
      throw new Error(
          `Shift end must be after start at line ${index + 1}`
      );
    }

    return {shiftStart, shiftEnd};
  });
};

export const getShiftsForSelectedDate = (
    shifts: Shift[],
    selectedDate: number | null
) => {
  if (selectedDate === null) return [];

  return shifts.filter((shift) => {
    const shiftDate = new Date(shift.shiftStart).getDate();
    return shiftDate === selectedDate;
  });
};

export const formatLocalDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
};
