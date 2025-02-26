import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import hoursService from "../services/hours.service";
import { hoursData } from "../types/hours.types";

const formatWorkedHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const useHours = () => {
  const queryClient = useQueryClient();

  const {
    data: hours = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workHours"],
    queryFn: async () => {
      const data = await hoursService.getWorkHours();
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
      const totalMinutes = parseInt(newRecord.workedHours);
      queryClient.setQueryData(["workHours"], (oldData: hoursData[] = []) => [
        ...oldData,
        {
          ...newRecord,
          totalMinutes,
          workedHours: formatWorkedHours(totalMinutes),
        },
      ]);
    },
  });

  return {
    hours,
    totalMinutes,
    isLoading,
    error,
    addHours: addHoursMutation.mutateAsync,
  };
};
