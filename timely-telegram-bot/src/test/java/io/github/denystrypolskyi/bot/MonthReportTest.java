package io.github.denystrypolskyi.bot;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MonthReportTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");

    @Test
    void resolvesCurrentMonthInConfiguredTimeZone() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-30T22:30:00Z"), ZoneOffset.UTC);

        YearMonth month = MonthReport.parseRequestedMonth("/month", clock, WARSAW);

        assertEquals(YearMonth.of(2026, 7), month);
    }

    @Test
    void parsesExplicitMonth() {
        YearMonth month = MonthReport.parseRequestedMonth(
                "/month 2026-06",
                Clock.systemUTC(),
                WARSAW
        );

        assertEquals(YearMonth.of(2026, 6), month);
    }

    @Test
    void rejectsInvalidMonth() {
        assertThrows(
                DateTimeParseException.class,
                () -> MonthReport.parseRequestedMonth(
                        "/month July 2026",
                        Clock.systemUTC(),
                        WARSAW
                )
        );
    }

    @Test
    void formatsSortedShiftsAndTotalInConfiguredTimeZone() {
        List<Shift> shifts = List.of(
                new Shift(
                        2L,
                        null,
                        Instant.parse("2026-07-03T06:00:00Z"),
                        Instant.parse("2026-07-03T14:00:00Z")
                ),
                new Shift(
                        1L,
                        510L,
                        Instant.parse("2026-07-02T06:00:00Z"),
                        Instant.parse("2026-07-02T14:30:00Z")
                )
        );

        String report = MonthReport.format(YearMonth.of(2026, 7), shifts, WARSAW);

        assertEquals("""
                📅 July 2026

                #1 · Jul 2 (Thu) · 08:00–16:30 · 8h 30m
                #2 · Jul 3 (Fri) · 08:00–16:00 · 8h

                ⏱ Total · 16h 30m""", report);
    }

    @Test
    void formatsEmptyMonth() {
        String report = MonthReport.format(YearMonth.of(2026, 7), List.of(), WARSAW);

        assertEquals("📅 July 2026\n\nNo shifts yet.", report);
    }
}
