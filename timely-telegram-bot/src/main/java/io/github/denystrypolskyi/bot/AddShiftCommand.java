package io.github.denystrypolskyi.bot;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Locale;

public final class AddShiftCommand {

    private static final DateTimeFormatter INPUT_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("uuuu-MM-dd", Locale.ROOT)
                    .withResolverStyle(ResolverStyle.STRICT);
    private static final DateTimeFormatter INPUT_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm", Locale.ROOT)
                    .withResolverStyle(ResolverStyle.STRICT);
    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH);
    private static final DateTimeFormatter DISPLAY_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);

    private AddShiftCommand() {
    }

    public static AddShiftDraft parse(String messageText, Clock clock, ZoneId timeZone) {
        String[] parts = messageText.trim().split("\\s+");

        LocalDate date;
        String startText;
        String endText;

        if (parts.length == 3) {
            date = LocalDate.now(clock.withZone(timeZone));
            startText = parts[1];
            endText = parts[2];
        } else if (parts.length == 4) {
            date = LocalDate.parse(parts[1], INPUT_DATE_FORMATTER);
            startText = parts[2];
            endText = parts[3];
        } else {
            throw new DateTimeParseException("Invalid /add syntax", messageText, 0);
        }

        LocalTime startTime = LocalTime.parse(startText, INPUT_TIME_FORMATTER);
        LocalTime endTime = LocalTime.parse(endText, INPUT_TIME_FORMATTER);
        if (startTime.equals(endTime)) {
            throw new DateTimeParseException("A shift cannot have zero duration", endText, 0);
        }

        LocalDateTime localStart = LocalDateTime.of(date, startTime);
        LocalDate endDate = endTime.isBefore(startTime) ? date.plusDays(1) : date;
        LocalDateTime localEnd = LocalDateTime.of(endDate, endTime);

        ZonedDateTime zonedStart = resolveLocalTime(localStart, timeZone);
        ZonedDateTime zonedEnd = resolveLocalTime(localEnd, timeZone);
        long durationMinutes = Duration.between(zonedStart, zonedEnd).toMinutes();
        if (durationMinutes <= 0) {
            throw new DateTimeParseException("A shift must have a positive duration", messageText, 0);
        }

        return new AddShiftDraft(
                localStart,
                localEnd,
                zonedStart.toInstant(),
                zonedEnd.toInstant(),
                durationMinutes
        );
    }

    public static String formatConfirmation(AddShiftDraft draft) {
        return formatDetails("➕ Add this shift?", draft);
    }

    public static String formatCreated(AddShiftDraft draft) {
        return formatDetails("✅ Shift added", draft);
    }

    private static String formatDetails(String heading, AddShiftDraft draft) {
        String timeRange;
        if (draft.localStart().toLocalDate().equals(draft.localEnd().toLocalDate())) {
            timeRange = DISPLAY_TIME_FORMATTER.format(draft.localStart())
                    + "–"
                    + DISPLAY_TIME_FORMATTER.format(draft.localEnd());
        } else {
            timeRange = DISPLAY_TIME_FORMATTER.format(draft.localStart())
                    + " → "
                    + DISPLAY_DATE_FORMATTER.format(draft.localEnd())
                    + " · "
                    + DISPLAY_TIME_FORMATTER.format(draft.localEnd());
        }

        return """
                %s

                📅 %s
                🕒 %s
                ⏱ %s
                """.formatted(
                heading,
                DISPLAY_DATE_FORMATTER.format(draft.localStart()),
                timeRange,
                ShiftText.duration(draft.durationMinutes())
        ).stripTrailing();
    }

    private static ZonedDateTime resolveLocalTime(LocalDateTime localDateTime, ZoneId timeZone) {
        ZonedDateTime resolved = localDateTime.atZone(timeZone);
        if (!resolved.toLocalDateTime().equals(localDateTime)) {
            throw new DateTimeParseException(
                    "This local time does not exist in " + timeZone,
                    localDateTime.toString(),
                    0
            );
        }
        return resolved;
    }

}
