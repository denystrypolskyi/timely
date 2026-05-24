import { useState } from "react";

const DEFAULT_HOURLY_RATE = 30.5;

export const useHourlyRate = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(
    Number(localStorage.getItem("hourlyRate")) || DEFAULT_HOURLY_RATE
  );

  const updateHourlyRate = (newRate: number) => {
    localStorage.setItem("hourlyRate", newRate.toString());
    setHourlyRate(newRate);
  };

  return {
    hourlyRate,
    updateHourlyRate,
  };
};
