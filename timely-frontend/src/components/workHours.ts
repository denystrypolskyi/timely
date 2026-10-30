import type {Shift} from "../types/shifts.types";

const parts = (date: Date, timeZone: string) => {
    const values = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    return Object.fromEntries(values.map(({type, value}) => [type, value]));
};

const includesSunday = (start: Date, end: Date, timeZone: string) => {
    const weekday = new Intl.DateTimeFormat("en-US", {timeZone, weekday: "short"});
    const first = start.getTime();
    const last = end.getTime();
    if (last <= first) return false;

    // Check the endpoints and points inside long shifts, using the account's time zone.
    if (weekday.format(start) === "Sun" || weekday.format(new Date(last - 1)) === "Sun") {
        return true;
    }
    for (let instant = first + 6 * 60 * 60 * 1000; instant < last; instant += 6 * 60 * 60 * 1000) {
        if (weekday.format(new Date(instant)) === "Sun") return true;
    }
    return false;
};

export const getWorkHoursRows = (
    shifts: Shift[], year: number, month: number, timeZone: string, locale: string
) => shifts
    .filter((shift) => {
        const start = parts(new Date(shift.shiftStart), timeZone);
        return Number(start.year) === year && Number(start.month) === month;
    })
    .sort((a, b) => Date.parse(a.shiftStart) - Date.parse(b.shiftStart))
    .map((shift) => {
        const startDate = new Date(shift.shiftStart);
        const endDate = new Date(shift.shiftEnd);
        const start = parts(startDate, timeZone);
        const end = parts(endDate, timeZone);
        const date = `${start.day}.${start.month}`;
        const endDay = `${end.day}.${end.month}`;
        const startTime = `${start.hour}:${start.minute}`;
        const endTime = `${end.hour}:${end.minute}`;
        const weekday = new Intl.DateTimeFormat(locale, {
            timeZone,
            weekday: "long",
        }).format(startDate);
        const timeRange = `${startTime}–${date === endDay && start.year === end.year ? "" : `${endDay} `}${endTime}`;
        const hours = Math.floor(shift.shiftDurationMinutes / 60);
        const minutes = shift.shiftDurationMinutes % 60;
        const duration = [hours > 0 ? `${hours} h` : "", minutes > 0 ? `${minutes} min` : ""]
            .filter(Boolean).join(" ") || "0 min";
        const sundayHours = includesSunday(startDate, endDate, timeZone);

        return {
            id: shift.id,
            date,
            timeRange,
            duration,
            weekday,
            sundayHours,
            text: `${date} ${timeRange} · ${duration} ${weekday}`,
        };
    });
