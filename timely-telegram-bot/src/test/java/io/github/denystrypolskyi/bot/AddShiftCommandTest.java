package io.github.denystrypolskyi.bot;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AddShiftCommandTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");
    private static final Clock CLOCK = Clock.fixed(
            Instant.parse("2026-07-19T10:00:00Z"),
            ZoneOffset.UTC
    );

    @Test
    void parsesShiftForToday() {
        AddShiftDraft draft = AddShiftCommand.parse("/add 08:00 16:30", CLOCK, WARSAW);

        assertEquals(LocalDateTime.of(2026, 7, 19, 8, 0), draft.localStart());
        assertEquals(LocalDateTime.of(2026, 7, 19, 16, 30), draft.localEnd());
        assertEquals(Instant.parse("2026-07-19T06:00:00Z"), draft.start());
        assertEquals(Instant.parse("2026-07-19T14:30:00Z"), draft.end());
        assertEquals(510, draft.durationMinutes());
    }

    @Test
    void parsesExplicitDate() {
        AddShiftDraft draft = AddShiftCommand.parse(
                "/add 2026-07-21 09:15 17:00",
                CLOCK,
                WARSAW
        );

        assertEquals(LocalDateTime.of(2026, 7, 21, 9, 15), draft.localStart());
        assertEquals(465, draft.durationMinutes());
    }

    @Test
    void treatsEarlierEndTimeAsOvernightShift() {
        AddShiftDraft draft = AddShiftCommand.parse(
                "/add 2026-07-21 22:00 06:00",
                CLOCK,
                WARSAW
        );

        assertEquals(LocalDateTime.of(2026, 7, 22, 6, 0), draft.localEnd());
        assertEquals(480, draft.durationMinutes());
    }

    @Test
    void rejectsZeroLengthShift() {
        assertThrows(
                DateTimeParseException.class,
                () -> AddShiftCommand.parse("/add 08:00 08:00", CLOCK, WARSAW)
        );
    }

    @Test
    void rejectsInvalidSyntax() {
        assertThrows(
                DateTimeParseException.class,
                () -> AddShiftCommand.parse("/add tomorrow morning", CLOCK, WARSAW)
        );
    }

    @Test
    void formatsOvernightConfirmationClearly() {
        AddShiftDraft draft = AddShiftCommand.parse(
                "/add 2026-07-21 22:00 06:00",
                CLOCK,
                WARSAW
        );

        assertEquals("""
                ➕ Add this shift?

                📅 July 21, 2026
                🕒 22:00 → July 22, 2026 · 06:00
                ⏱ 8h""", AddShiftCommand.formatConfirmation(draft));
    }
}
