import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import shiftService from "../services/shifts.service";
import {Shift} from "../types/shifts.types";
import {getCurrentYearMonth} from "../utils/utils";

const shiftsQueryKey = (year: number, month: number) =>
    ["shifts", year, month] as const;

export const useShifts = () => {
    const queryClient = useQueryClient();
    const {year, month} = getCurrentYearMonth();
    const [currentYear, setCurrentYear] = useState(year);
    const [currentMonth, setCurrentMonth] = useState(month);

    const {
        data: shifts = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: shiftsQueryKey(currentYear, currentMonth),
        queryFn: () => shiftService.getShiftsForMonth(currentYear, currentMonth),
        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const totalMinutes = shifts.reduce(
        (sum, record) => sum + record.shiftDurationMinutes,
        0
    );

    const addShiftMutation = useMutation({
        mutationFn: shiftService.addShift,
        onSuccess: (newRecord) => {
            const newRecordDate = new Date(newRecord.shiftStart);
            const newRecordYear = newRecordDate.getFullYear();
            const newRecordMonth = newRecordDate.getMonth() + 1;

            if (newRecordYear === currentYear && newRecordMonth === currentMonth) {
                queryClient.setQueryData(
                    shiftsQueryKey(currentYear, currentMonth),
                    (oldData: Shift[] = []) => [...oldData, newRecord]
                );
            }
        },
    });

    const deleteShiftMutation = useMutation({
        mutationFn: shiftService.deleteShift,
        onSuccess: (_, id) => {
            queryClient.setQueryData(
                shiftsQueryKey(currentYear, currentMonth),
                (oldData: Shift[] = []) =>
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
