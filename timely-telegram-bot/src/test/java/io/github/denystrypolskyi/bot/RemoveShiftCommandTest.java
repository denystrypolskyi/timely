package io.github.denystrypolskyi.bot;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RemoveShiftCommandTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");

    @Test
    void parsesShiftId() {
        assertEquals(42L, RemoveShiftCommand.parseShiftId("/remove 42"));
    }

    @Test
    void rejectsMissingInvalidAndNegativeIds() {
        assertThrows(IllegalArgumentException.class, () -> RemoveShiftCommand.parseShiftId("/remove"));
        assertThrows(IllegalArgumentException.class, () -> RemoveShiftCommand.parseShiftId("/remove abc"));
        assertThrows(IllegalArgumentException.class, () -> RemoveShiftCommand.parseShiftId("/remove -1"));
    }

    @Test
    void formatsConfirmation() {
        Shift shift = new Shift(
                42L,
                510L,
                Instant.parse("2026-07-21T06:00:00Z"),
                Instant.parse("2026-07-21T14:30:00Z")
        );

        assertEquals("""
                🗑 Remove shift #42?

                📅 July 21, 2026
                🕒 08:00–16:30
                ⏱ 8h 30m""", RemoveShiftCommand.formatConfirmation(shift, WARSAW));
    }
}
