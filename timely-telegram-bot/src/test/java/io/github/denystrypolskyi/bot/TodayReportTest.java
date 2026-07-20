package io.github.denystrypolskyi.bot;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TodayReportTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");

    @Test
    void formatsTodaysShiftsAndDailyTotal() {
        List<Shift> shifts = List.of(
                new Shift(
                        3L,
                        240L,
                        Instant.parse("2026-07-19T11:00:00Z"),
                        Instant.parse("2026-07-19T15:00:00Z")
                ),
                new Shift(
                        2L,
                        null,
                        Instant.parse("2026-07-19T06:00:00Z"),
                        Instant.parse("2026-07-19T10:30:00Z")
                ),
                new Shift(
                        1L,
                        480L,
                        Instant.parse("2026-07-18T06:00:00Z"),
                        Instant.parse("2026-07-18T14:00:00Z")
                )
        );

        String report = TodayReport.format(LocalDate.of(2026, 7, 19), shifts, WARSAW);

        assertEquals("""
                ☀️ Today · July 19, 2026

                #2 · 08:00–12:30 · 4h 30m
                #3 · 13:00–17:00 · 4h

                ⏱ Total · 8h 30m""", report);
    }

    @Test
    void usesWarsawDateWhenFilteringShifts() {
        Shift afterMidnightInWarsaw = new Shift(
                1L,
                60L,
                Instant.parse("2026-07-18T22:30:00Z"),
                Instant.parse("2026-07-18T23:30:00Z")
        );

        String report = TodayReport.format(
                LocalDate.of(2026, 7, 19),
                List.of(afterMidnightInWarsaw),
                WARSAW
        );

        assertEquals("""
                ☀️ Today · July 19, 2026

                #1 · 00:30–01:30 · 1h

                ⏱ Total · 1h""", report);
    }

    @Test
    void formatsEmptyDay() {
        String report = TodayReport.format(LocalDate.of(2026, 7, 19), List.of(), WARSAW);

        assertEquals("☀️ Today · July 19, 2026\n\nNo shifts yet.", report);
    }
}
