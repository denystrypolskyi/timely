package io.github.denystrypolskyi.bot;

import java.time.Clock;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public final class MonthReport {

    private static final DateTimeFormatter MONTH_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM uuuu", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d (EEE)", Locale.ENGLISH);
    private MonthReport() {
    }

    public static YearMonth parseRequestedMonth(String messageText, Clock clock, ZoneId timeZone) {
        String[] parts = messageText.trim().split("\\s+");
        if (parts.length == 1) {
            return YearMonth.now(clock.withZone(timeZone));
        }
        if (parts.length != 2) {
            throw new DateTimeParseException("Expected /month or /month YYYY-MM", messageText, 0);
        }

        return YearMonth.parse(parts[1]);
    }

    public static String format(YearMonth month, List<Shift> shifts, ZoneId timeZone) {
        String title = month.format(MONTH_FORMATTER);
        if (shifts.isEmpty()) {
            return "📅 " + title + "\n\nNo shifts yet.";
        }

        List<Shift> sortedShifts = shifts.stream()
                .sorted(Comparator.comparing(Shift::start))
                .toList();

        StringBuilder report = new StringBuilder("📅 ").append(title).append('\n');
        long totalMinutes = 0;

        for (Shift shift : sortedShifts) {
            long durationMinutes = ShiftText.durationMinutes(shift);
            totalMinutes += durationMinutes;
            report.append('\n')
                    .append('#')
                    .append(shift.id())
                    .append(" · ")
                    .append(DATE_FORMATTER.format(shift.start().atZone(timeZone)))
                    .append(" · ")
                    .append(ShiftText.timeRange(shift, timeZone))
                    .append(" · ")
                    .append(ShiftText.duration(durationMinutes));
        }

        report.append("\n\n⏱ Total · ").append(ShiftText.duration(totalMinutes));
        return report.toString();
    }
}
