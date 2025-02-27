import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import hoursService from "../services/hours.service";
import { hoursData } from "../types/hours.types";

const formatWorkedHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1 
  };
};

export const useHours = () => {
  const queryClient = useQueryClient();
  const { year, month } = getCurrentYearMonth();
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);

  const {
    data: hours = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workHours", currentYear, currentMonth],
    queryFn: async () => {
      const data = await hoursService.getWorkHoursForMonth(currentYear, currentMonth);
      return data.map((record) => {
        const totalMinutes = parseInt(record.workedHours);
        return {
          ...record,
          totalMinutes,
          workedHours: formatWorkedHours(totalMinutes),
        };
      });
    },
  });

  const totalMinutes = hours.reduce(
    (sum, record) => sum + record.totalMinutes,
    0
  );

  const addHoursMutation = useMutation({
    mutationFn: hoursService.addWorkHours,
    onSuccess: (newRecord) => {
      const newRecordDate = new Date(newRecord.shiftStart);
      const newRecordYear = newRecordDate.getFullYear();
      const newRecordMonth = newRecordDate.getMonth() + 1;

      if (newRecordYear === currentYear && newRecordMonth === currentMonth) {
        const totalMinutes = parseInt(newRecord.workedHours);
        queryClient.setQueryData(["workHours", currentYear, currentMonth], (oldData: hoursData[] = []) => [
          ...oldData,
          {
            ...newRecord,
            totalMinutes,
            workedHours: formatWorkedHours(totalMinutes),
          },
        ]);
      }
    },
  });

  const setMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return {
    hours,
    totalMinutes,
    isLoading,
    error,
    addHours: addHoursMutation.mutateAsync,
    setMonth,
    currentYear,
    currentMonth,
  };
};
