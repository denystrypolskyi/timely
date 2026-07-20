package io.github.denystrypolskyi.bot;

import java.time.Duration;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class ShiftText {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);

    private ShiftText() {
    }

    public static long durationMinutes(Shift shift) {
        if (shift.durationMinutes() != null) {
            return Math.max(0, shift.durationMinutes());
        }
        return Math.max(0, Duration.between(shift.start(), shift.end()).toMinutes());
    }

    public static String duration(long totalMinutes) {
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;

        if (hours == 0) {
            return minutes + "m";
        }
        if (minutes == 0) {
            return hours + "h";
        }
        return hours + "h " + minutes + "m";
    }

    public static String timeRange(Shift shift, ZoneId timeZone) {
        ZonedDateTime start = shift.start().atZone(timeZone);
        ZonedDateTime end = shift.end().atZone(timeZone);

        if (start.toLocalDate().equals(end.toLocalDate())) {
            return TIME.format(start) + "–" + TIME.format(end);
        }
        return TIME.format(start) + "–" + DATE.format(end) + " " + TIME.format(end);
    }
}
