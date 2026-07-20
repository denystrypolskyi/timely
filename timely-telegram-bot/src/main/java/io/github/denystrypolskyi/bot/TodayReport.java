package io.github.denystrypolskyi.bot;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public final class TodayReport {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH);
    private TodayReport() {
    }

    public static String format(LocalDate today, List<Shift> shifts, ZoneId timeZone) {
        List<Shift> todaysShifts = shifts.stream()
                .filter(shift -> shift.start().atZone(timeZone).toLocalDate().equals(today))
                .sorted(Comparator.comparing(Shift::start))
                .toList();

        if (todaysShifts.isEmpty()) {
            return "☀️ Today · " + DATE_FORMATTER.format(today) + "\n\nNo shifts yet.";
        }

        StringBuilder report = new StringBuilder("☀️ Today · ")
                .append(DATE_FORMATTER.format(today))
                .append('\n');
        long totalMinutes = 0;

        for (Shift shift : todaysShifts) {
            long durationMinutes = ShiftText.durationMinutes(shift);
            totalMinutes += durationMinutes;
            report.append('\n')
                    .append('#')
                    .append(shift.id())
                    .append(" · ")
                    .append(ShiftText.timeRange(shift, timeZone))
                    .append(" · ")
                    .append(ShiftText.duration(durationMinutes));
        }

        report.append("\n\n⏱ Total · ").append(ShiftText.duration(totalMinutes));
        return report.toString();
    }
}
