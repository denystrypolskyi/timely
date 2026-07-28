import { useState } from "react";

const DEFAULT_HOURLY_RATE = 30.5;
const HOURLY_RATE_STORAGE_KEY = "timelyHourlyRate";
const LEGACY_HOURLY_RATE_STORAGE_KEY = "hourlyRate";
const CURRENCY_STORAGE_KEY = "timelyCurrency";
export const supportedCurrencies = ["PLN", "EUR", "USD", "UAH", "RUB"] as const;
export type Currency = typeof supportedCurrencies[number];

const getInitialHourlyRate = () => {
  const savedRate = localStorage.getItem(HOURLY_RATE_STORAGE_KEY);
  if (savedRate !== null) {
    return Number(savedRate);
  }

  const legacyRate = localStorage.getItem(LEGACY_HOURLY_RATE_STORAGE_KEY);
  if (legacyRate !== null) {
    localStorage.setItem(HOURLY_RATE_STORAGE_KEY, legacyRate);
    localStorage.removeItem(LEGACY_HOURLY_RATE_STORAGE_KEY);
    return Number(legacyRate);
  }

  return DEFAULT_HOURLY_RATE;
};

const getInitialCurrency = (): Currency => {
  const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return supportedCurrencies.includes(savedCurrency as Currency)
    ? savedCurrency as Currency
    : "PLN";
};

export const useHourlyRate = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(getInitialHourlyRate);
  const [currency, setCurrency] = useState<Currency>(getInitialCurrency);

  const updateHourlyRate = (newRate: number) => {
    localStorage.setItem(HOURLY_RATE_STORAGE_KEY, newRate.toString());
    setHourlyRate(newRate);
  };

  const updateCurrency = (newCurrency: Currency) => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    setCurrency(newCurrency);
  };

  return {
    hourlyRate,
    updateHourlyRate,
    currency,
    updateCurrency,
  };
};
