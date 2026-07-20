package io.github.denystrypolskyi.bot;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class RemoveShiftCommand {

    private static final DateTimeFormatter DATE =
            DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH);

    private RemoveShiftCommand() {
    }

    public static long parseShiftId(String messageText) {
        String[] parts = messageText.trim().split("\\s+");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Expected /remove ID");
        }

        try {
            long shiftId = Long.parseLong(parts[1]);
            if (shiftId <= 0) {
                throw new IllegalArgumentException("Shift ID must be positive");
            }
            return shiftId;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Shift ID must be a number", exception);
        }
    }

    public static String formatConfirmation(Shift shift, ZoneId timeZone) {
        return formatDetails("🗑 Remove shift #" + shift.id() + "?", shift, timeZone);
    }

    public static String formatDeleted(Shift shift, ZoneId timeZone) {
        return formatDetails("✅ Shift #" + shift.id() + " removed", shift, timeZone);
    }

    private static String formatDetails(String heading, Shift shift, ZoneId timeZone) {
        return "%s\n\n📅 %s\n🕒 %s\n⏱ %s".formatted(
                heading,
                DATE.format(shift.start().atZone(timeZone)),
                ShiftText.timeRange(shift, timeZone),
                ShiftText.duration(ShiftText.durationMinutes(shift))
        );
    }
}
