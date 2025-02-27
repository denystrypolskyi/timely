import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import shiftService from "../services/shifts.service";
import { ShiftData } from "../types/shifts.types";

const formatMinutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

export const useShifts = () => {
  const queryClient = useQueryClient();
  const { year, month } = getCurrentYearMonth();
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);

  const {
    data: shifts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shifts", currentYear, currentMonth],
    queryFn: async () => {
      const data = await shiftService.getShiftsForMonth(
        currentYear,
        currentMonth
      );
      return data.map((record) => {
        const totalMinutes = parseInt(record.shiftDurationMinutes);
        return {
          ...record,
          totalMinutes,
          shiftDurationMinutes: formatMinutesToHours(totalMinutes),
        };
      });
    },
  });

  const totalMinutes = shifts.reduce(
    (sum, record) => sum + record.totalMinutes,
    0
  );

  const addShiftMutation = useMutation({
    mutationFn: shiftService.addShift,
    onSuccess: (newRecord) => {
      const newRecordDate = new Date(newRecord.shiftStart);
      const newRecordYear = newRecordDate.getFullYear();
      const newRecordMonth = newRecordDate.getMonth() + 1;

      if (newRecordYear === currentYear && newRecordMonth === currentMonth) {
        const totalMinutes = parseInt(newRecord.shiftDurationMinutes);
        queryClient.setQueryData(
          ["shifts", currentYear, currentMonth],
          (oldData: ShiftData[] = []) => [
            ...oldData,
            {
              ...newRecord,
              totalMinutes,
              shiftDurationMinutes: formatMinutesToHours(totalMinutes),
            },
          ]
        );
      }
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: shiftService.deleteShift,
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["shifts", currentYear, currentMonth],
        (oldData: ShiftData[] = []) =>
          oldData.filter((record) => record.id !== id)
      );
    },
  });

  const setMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return {
    shifts,
    totalMinutes,
    isLoading,
    error,
    addShift: addShiftMutation.mutateAsync,
    deleteShift: deleteShiftMutation.mutateAsync,
    setMonth,
    currentYear,
    currentMonth,
  };
};
